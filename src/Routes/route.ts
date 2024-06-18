import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode , sign , verify } from 'hono/jwt'
import { use } from 'hono/jsx'
import user from './user'
import blog from './blog'



const router = new Hono<{
	Bindings:{
		DATABASE_URL:string
	}
}>().basePath('/api/v1/')



router.route('/', blog) // Handle /blo

router.route('/', user) // Handle /user
export default  router