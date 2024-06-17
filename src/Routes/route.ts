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

router.use('/blog/*',async (c,next)=>{
	const header = c.req.header("authorization") || "";
	const response  = await verify(header,c.env.DATABASE_URL)
	if(response.id){
		next()
	}else{
		return c.json({
			error:"unauthorized"
		})
	}
})

router.route('/', blog) // Handle /blog

router.route('/', user) // Handle /user
export default  router