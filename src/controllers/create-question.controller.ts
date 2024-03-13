import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { JwtAuthGuard } from '@/auth/jwt-auth.guard'
import { CurrentUser } from '@/auth/current-user-decorator'
import { TokenPayload } from '@/auth/jwt.strategy'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipes'
import { z } from 'zod'
import { slugify } from '@/utils/slug'

const createQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
})

type CreateQuestionBodySchema = z.infer<typeof createQuestionBodySchema>

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(new ZodValidationPipe(createQuestionBodySchema))
    data: CreateQuestionBodySchema,
    @CurrentUser() user: TokenPayload,
  ) {
    const userId = user.sub
    const { title, content } = data

    return await this.prisma.question.create({
      data: {
        title,
        content,
        authorId: userId,
        slug: slugify(title),
      },
    })
  }
}
