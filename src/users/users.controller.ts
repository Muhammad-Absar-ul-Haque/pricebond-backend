import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { UpdateUserDto } from "./dto/user-update.dto";

@ApiTags("Users")
@ApiBearerAuth()
@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /api/users  ← Admin use: list all users
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: "List all users (admin)" })
  findAll() {
    return this.usersService.findAll();
  }

  // GET /api/users/:id
  @Get(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user by id" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

  // PATCH /api/users/:id
  @Patch(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update user profile details" })
  @ApiBody({ type: UpdateUserDto })
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }
}
