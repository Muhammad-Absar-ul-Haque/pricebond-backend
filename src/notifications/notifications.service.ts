import { Injectable, OnModuleInit, Logger, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private firebaseApp: admin.app.App;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    // 1. Try Environment Variables (Best for Production/Cloud)
    const envConfig = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };

    if (envConfig.projectId && envConfig.privateKey && envConfig.clientEmail) {
      try {
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(envConfig as admin.ServiceAccount),
        });
        this.logger.log('✅ Firebase Admin SDK initialized via Environment Variables.');
        return;
      } catch (error) {
        this.logger.error(`❌ Failed to initialize Firebase via Env Vars: ${error.message}`);
      }
    }

    // 2. Fallback to JSON File (Best for Local Development)
    const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');

    if (fs.existsSync(serviceAccountPath)) {
      try {
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccountPath),
        });
        this.logger.log('✅ Firebase Admin SDK initialized via JSON file.');
      } catch (error) {
        this.logger.error(`❌ Failed to initialize Firebase via JSON: ${error.message}`);
      }
    } else {
      this.logger.warn('⚠️ Firebase credentials not found (Env Vars or JSON). Push notifications will be logged but not sent.');
    }
  }

  /**
   * Sends a push notification to a specific user and records it in the database.
   */
  async sendPushNotification(
    userId: number,
    title: string,
    body: string,
    type: NotificationType,
    data: any = {},
  ) {
    this.logger.log(`Preparing notification for user ${userId}: ${title}`);

    // 1. Save to database (Persistence)
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        title,
        body,
        type,
      },
    });

    // 2. Fetch user's FCM token
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    if (!user) {
      this.logger.error(`User with id ${userId} not found when trying to send notification.`);
      return notification;
    }

    if (!user.fcmToken) {
      this.logger.log(`No fcmToken found for user ${userId}. Skipping FCM dispatch.`);
      return notification;
    }

    // 3. Send via Firebase Admin SDK
    if (this.firebaseApp) {
      try {
        const message: admin.messaging.Message = {
          notification: { title, body },
          // Data keys must be strings for FCM
          data: { 
            ...Object.keys(data).reduce((acc, key) => ({ ...acc, [key]: String(data[key]) }), {}),
            type 
          },
          token: user.fcmToken,
        };

        const response = await admin.messaging().send(message);
        this.logger.log(`🚀 FCM message sent successfully: ${response}`);
      } catch (error) {
        this.logger.error(`❌ Error sending FCM message to user ${userId}: ${error.message}`);
      }
    } else {
      this.logger.warn(`Firebase not initialized. Push for user ${userId} recorded in DB only.`);
    }

    return notification;
  }

  /**
   * Fetches the notification history for a specific user.
   */
  async getUserNotifications(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50
    });
  }

  /**
   * Marks a notification as read.
   */
  async markAsRead(notificationId: number, userId: number) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }
}
