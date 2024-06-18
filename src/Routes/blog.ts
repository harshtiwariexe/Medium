import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode , sign , verify } from 'hono/jwt'
import { use } from 'hono/jsx'
import { blogInput, updateBlogInput } from 'harsh-medium-common'

const blog = new Hono<{
	Bindings:{
		DATABASE_URL:string	,
		JWT_SECRET:string
	},
	Variables:{
		userId:string,
	}
}>().basePath('/blog')

blog.use('/*', async (c, next) => {
    const authToken = c.req.header("Authorization") || ""
    const user = await verify(authToken, c.env.JWT_SECRET)
    if (user) {
		// @ts-ignore
        c.set('userId', user.id)
        await next()
    } else {
        c.status(403)
        return c.json("You are not logged in")
    }
})



  blog.post('/new', async (c) => {
	try {
	  const userId = c.get('userId');
	  const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	  }).$extends(withAccelerate());
	  
	  if (!userId) {
		return c.json({ error: 'Unauthorized' }, 401);
	  }
  
	  const body = await c.req.json();
	  const {success} = blogInput.safeParse(body)
	if(!success){
		c.status(403)
		return c.json("Invalid credentials")
	}
  
	  if (!body.title || !body.content) {
		return c.json({ error: 'Invalid input' }, 400);
	  }
  
	  const post = await prisma.post.create({
		data: {
		  title: body.title,
		  content: body.content,
		  authorId: userId,
		},
	  });
  
	  return c.json({ id: post.id });
	} catch (error) {
	  console.error(error);
	  return c.json({ error: 'Internal Server Error' }, 500);
	}
  });

blog.put('/',async c =>{
	//@ts-ignore
	const userId = c.get('userId')	
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());
	const body = await c.req.json()
	const {success} = updateBlogInput.safeParse(body)
	if(!success){
		c.status(403)
		return c.json("Invalid credentials")
	}
	await prisma.post.update({
		where:{
			id:body.id,
			authorId:userId
		},
		data:{
			title:body.title,
			content:body.content
		}
	})
	return c.json('Post updated')
})

blog.get('/:id',async c =>{
	const id = await c.req.param('id')
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());
	const post = await prisma.post.findUnique({
		where:{
			id
		}
	})
	return c.json(post)
})

blog.post('/all', async (c) => {
		const prisma = new PrismaClient({
			datasourceUrl: c.env.DATABASE_URL,
		  }).$extends(withAccelerate());
		  const blog = await prisma.post.findMany()
		  
		  return c.json({blog})

  });


export default blog