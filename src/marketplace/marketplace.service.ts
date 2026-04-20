import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingStatusDto } from './dto/update-listing-status.dto';
import { MarketplaceStatus, BondStatus, NotificationType } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MarketplaceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Create a new marketplace listing for the authenticated seller.
   */
  async createListing(sellerId: number, dto: CreateListingDto) {
    return this.prisma.marketplaceListing.create({
      data: {
        serial: dto.serial,
        denomination: dto.denomination,
        bondDetails: dto.bondDetails || null,
        sellerId,
      },
      include: {
        seller: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  /**
   * Fetch all ACTIVE listings, excluding the current user's own listings.
   */
  async findAllActive(currentUserId: number) {
    return this.prisma.marketplaceListing.findMany({
      where: {
        status: MarketplaceStatus.ACTIVE,
        sellerId: { not: currentUserId },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            city: true,
          },
        },
      },
    });
  }

  /**
   * Get full details of a single listing (used for detail view / chat screen).
   */
  async findOne(listingId: number) {
    const listing = await this.prisma.marketplaceListing.findUnique({
      where: { id: listingId },
      include: {
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            mobile: true,
            city: true,
          },
        },
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    return listing;
  }

  /**
   * Update listing status. Only the seller can perform this action.
   *
   * When status changes to SOLD:
   *  1. Associates the buyerId with the listing.
   *  2. Creates a new UserBond for the buyer (automatic transfer).
   *  3. Removes the matching UserBond from the seller's list.
   */
  async updateStatus(
    sellerId: number,
    listingId: number,
    dto: UpdateListingStatusDto,
  ) {
    // 1. Fetch the listing and verify ownership
    const listing = await this.prisma.marketplaceListing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.sellerId !== sellerId) {
      throw new ForbiddenException('Only the seller can update this listing');
    }

    if (listing.status !== MarketplaceStatus.ACTIVE) {
      throw new BadRequestException(
        'Only ACTIVE listings can be updated',
      );
    }

    // 2. If marking as SOLD, require a buyerId
    if (dto.status === MarketplaceStatus.SOLD) {
      if (!dto.buyerId) {
        throw new BadRequestException(
          'buyerId is required when marking a listing as SOLD',
        );
      }

      // Prevent seller from buying their own listing
      if (dto.buyerId === sellerId) {
        throw new BadRequestException('You cannot buy your own listing');
      }

      // Verify buyer exists
      const buyer = await this.prisma.user.findUnique({
        where: { id: dto.buyerId },
      });

      if (!buyer) {
        throw new NotFoundException('Buyer not found');
      }

      // Use a transaction to ensure atomicity
      return this.prisma.$transaction(async (tx) => {
        // a. Update listing status and assign buyer
        const updatedListing = await tx.marketplaceListing.update({
          where: { id: listingId },
          data: {
            status: MarketplaceStatus.SOLD,
            buyerId: dto.buyerId,
          },
          include: {
            seller: { select: { id: true, firstName: true, lastName: true } },
            buyer: { select: { id: true, firstName: true, lastName: true } },
          },
        });

        // b. Check if the bond is a winner
        const winningMatch = await tx.winningNumber.findFirst({
          where: {
            serial: listing.serial,
            draw: { denomination: listing.denomination },
          },
        });

        // c. Add bond to buyer's "My Bonds" list
        await tx.userBond.create({
          data: {
            serial: listing.serial,
            denomination: listing.denomination,
            userId: dto.buyerId,
            status: winningMatch ? BondStatus.WINNER : BondStatus.CHECKED,
          },
        });

        // d. Remove matching bond from seller's "My Bonds" list
        await tx.userBond.deleteMany({
          where: {
            userId: sellerId,
            serial: listing.serial,
            denomination: listing.denomination,
          },
        });

        // 📱 Send Push Notifications (non-blocking outside the core transaction but logically part of the process)
        // Note: In a real prod app, you might emit an event or use a queue for this.
        
        // Notify Buyer
        this.notifications.sendPushNotification(
          dto.buyerId,
          "New Bond Transferred 🎁",
          `Bond ${listing.serial} (${listing.denomination}) has been transferred to your account from ${updatedListing.seller.firstName}.`,
          NotificationType.MARKETPLACE,
          { listingId: String(listingId), serial: listing.serial }
        ).catch(err => console.error('Notification failed for buyer:', err));

        // Notify Seller
        this.notifications.sendPushNotification(
          sellerId,
          "Listing Sold! 💰",
          `Your listing for bond ${listing.serial} has been successfully marked as sold to ${updatedListing.buyer.firstName}.`,
          NotificationType.MARKETPLACE,
          { listingId: String(listingId), serial: listing.serial }
        ).catch(err => console.error('Notification failed for seller:', err));

        return updatedListing;
      });
    }

    // 3. If REMOVED, just update the status
    return this.prisma.marketplaceListing.update({
      where: { id: listingId },
      data: { status: dto.status },
      include: {
        seller: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  /**
   * Fetch listings created by the authenticated user (seller's own listings).
   * Optionally filter by status.
   */
  async findMyListings(sellerId: number, status?: MarketplaceStatus) {
    return this.prisma.marketplaceListing.findMany({
      where: {
        sellerId,
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }
}
