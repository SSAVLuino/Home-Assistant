export async function withProject(req,res,next){const p=req.headers['x-project-id'];if(!p)return res.status(400).json({error:'Missing project'});req.projectId=p;next();}
