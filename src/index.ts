import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode , sign , verify } from 'hono/jwt'
import { use } from 'hono/jsx'

const blog = new Hono<{
	Bindings:{
		DATABASE_URL:string	
	}
}>().basePath('/blog')



blog.get('/', (c) => {
	

	return c.text('Get All the blogs')}) // GET /book

blog.post('/new', (c) => c.text('Post the blogs')) // POST /book

blog.get('/:id', (c) => {
	const id = c.req.param('id')
	console.log(id);
	return c.text('get blog route')
})


const user = new Hono<{
	Bindings:{
		DATABASE_URL:string	,
		JWT_SECRET:string
	}
}>().basePath('/user')

user.post('/signup', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());
	const body = await c.req.json();
	try {
		const user = await prisma.user.create({
			data: {
				email: body.email,
				password: body.password
			}
		});
		const token =await sign({id:user.id},c.env.JWT_SECRET)

	
		return c.json({
			jwt:token
		})
	} catch(e) {
		return c.status(403);
	}
})

user.post('/signin',async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());
	const body = await c.req.json();
	const user = await prisma.user.findUnique({
		where:{
			email:body.email
		}
	})
	if(!user) {
		c.status(403)
		return c.json({
			error:"User not found"
		})
	}
	const jwt = await 	sign({id:user.id},c.env.JWT_SECRET)
	return c.json({jwt})
}) // POST /user

const app = new Hono<{
	Bindings:{
		DATABASE_URL:string
	}
}>().basePath('/api/v1/')

app.use('/blog/*',async (c,next)=>{
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

app.route('/', blog) // Handle /blog

app.route('/', user) // Handle /user
export default  app