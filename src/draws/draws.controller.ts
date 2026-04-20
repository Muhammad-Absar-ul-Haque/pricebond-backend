import { Controller, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import { DrawsService } from "./draws.service";
import { CheckResultDto } from "./dto/check-result.dto";

@ApiTags("Public - Draws & Results")
@Controller("results")
export class DrawsController {
  constructor(private readonly drawsService: DrawsService) {}

  // GET /results  — list all draws (with hasResult & resultPdfUrl)
  @Get()
  @ApiOperation({ summary: "List all prize bond draws" })
  @ApiQuery({ name: "denomination", required: false, type: Number })
  findAll(@Query("denomination") denomination?: string) {
    return this.drawsService.listDraws(
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
