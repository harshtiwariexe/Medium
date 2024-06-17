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
export default blog