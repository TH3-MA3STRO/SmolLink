import { Elysia, t } from "elysia";
import Link from "./model/link"
import mongoose from "mongoose";
const MONGO_URI = Bun.env.mongo_uri
mongoose.connect(MONGO_URI)
.then(() => {
  console.log("Connected to the database!");
})
function createRandomString(length:number):String {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
let schema:any = {
  body: t.Object({
    link: t.String(),
    shorthand: t.String()
  })}
const app = new Elysia().get("/", () => "A simple tool to shorten links!")
app.post("/generate", async ({ body,set }: { body: any, set:any }) => {
  let url;
  if(body.link.includes("http://") || body.link.includes("https://")){
    url = new URL(body.link);
}
  else {
    url = new URL("https://"+body.link);    
  }
  
  if(body.shorthand==" "){
    const link = await Link.findOne({ link: url.host + url.pathname });
      if (link) {
        return new Response(link.shorthandLink);
      } else {
        const newLink = new Link({
          link: url.host + url.pathname,
          shorthandLink: createRandomString(Math.random() * (5 - 3) + 3)
        });
        newLink.save();
        return new Response(newLink.shorthandLink);
      }
  } else {
    const link = await Link.findOne({ shorthandLink:body.shorthand })
      if (link){
        set.status = 404;
        return new Response("Sorry that shorthand is already taken!");
      } else {
        const newLink = new Link({
          link: url.host + url.pathname,
          shorthandLink: body.shorthand
        });
        newLink.save();
        return new Response(newLink.shorthandLink);
      }
  }
}, schema)
app.get("/:shorthand", async ({ set,params }) => {
  const link = await Link.findOne({ shorthandLink: params.shorthand });
  if (link) {
    set.redirect = "https://"+link.link;
  } else {
    return new Response("Sorry that link doesn't exist!");
  }
})
app.listen(3000);
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
