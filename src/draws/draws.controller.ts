import { Controller, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import { DrawsService } from "./draws.service";
import { CheckResultDto } from "./dto/check-result.dto";

@ApiTags("Public - Draws & Results")
@Controller("results")
export class DrawsController {
  constructor(private readonly drawsService: DrawsService) {}

  @Get()
  @ApiOperation({ summary: "List prize bond draws with available results" })
  @ApiQuery({ name: "denomination", required: false, type: Number })
  @ApiQuery({ name: "city", required: false, type: String })
  @ApiQuery({ name: "date", required: false, type: String, example: "2026-01-15" })
  findAll(
    @Query("denomination") denomination?: string,
    @Query("city") city?: string,
    @Query("date") date?: string,
  ) {
    return this.drawsService.listDraws(
      denomination ? +denomination : undefined,
      true, // onlyWithResults
      city,
      date,
    );
  }

  @Get("schedule")
  @ApiOperation({ summary: "Get annual draw schedule" })
  @ApiQuery({ name: "year", required: true, type: Number, example: 2026 })
  @ApiQuery({ name: "denomination", required: false, type: Number })
  getSchedule(
    @Query("year", ParseIntPipe) year: number,
    @Query("denomination") denomination?: string,
  ) {
    return this.drawsService.getSchedule(
      year,
      denomination ? +denomination : undefined,
    );
  }

  // GET /results/check  — check a serial number
  @Get("check")
  @ApiOperation({ summary: "Check if a specific bond serial number has won" })
  check(@Query() query: CheckResultDto) {
    return this.drawsService.checkResult(query);
  }

  // GET /results/:id  — draw detail with PDF result download URL
  @Get(":id")
  @ApiOperation({
    summary:
      "Get draw detail including downloadable result PDF uploaded by admin",
  })
  @ApiParam({ name: "id", type: Number, description: "Draw ID" })
  getDetail(@Param("id", ParseIntPipe) id: number) {
    return this.drawsService.getDrawDetail(id);
  }
}
