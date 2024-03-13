import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma/prisma.service'
import { slugify } from '@/utils/slug'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'

describe('Fetch recent questions (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /questions', async () => {
    const mockedUser = {
      name: 'John Doe',
      email: 'johndoe@mail.com',
      password: '123456',
    }

    const user = await prisma.user.create({
      data: mockedUser,
    })

    const accessToken = jwt.sign({ sub: user.id })

    const mockedQuestions = Array.from({ length: 5 }).map((_, idx) => ({
      title: `New question 0${idx + 1}`,
      slug: slugify(`New question 0${idx + 1}`),
      content: 'Question Content',
      authorId: user.id,
    }))

    await prisma.question.createMany({
      data: mockedQuestions,
    })

    const response = await request(app.getHttpServer())
      .get('/questions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      questions: [
        expect.objectContaining({ title: 'New question 01' }),
        expect.objectContaining({ title: 'New question 02' }),
        expect.objectContaining({ title: 'New question 03' }),
        expect.objectContaining({ title: 'New question 04' }),
        expect.objectContaining({ title: 'New question 05' }),
      ],
    })
  })
})
