import {
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common'
import { compare } from 'bcryptjs'
import { z } from 'zod'
import { PrismaService } from '@/prisma/prisma.service'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipes'
import { JwtService } from '@nestjs/jwt'

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@Controller('/sessions')
export class AuthenticateController {
  constructor(
    private prisma: PrismaService,
    private jsw: JwtService,
  ) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(@Body() data: AuthenticateBodySchema) {
    const { email, password } = data

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (!user) throw new UnauthorizedException('User credentials do not match.')

    const isPasswordValid = await compare(password, user.password)

    if (!isPasswordValid) {
      throw new UnauthorizedException('User credentials do not match.')
    }

    const accessToken = this.jsw.sign({ sub: user.id })

    return { access_token: accessToken }
  }
}
