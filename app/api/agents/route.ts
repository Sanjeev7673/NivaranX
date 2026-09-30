import {NextResponse} from "next/server";
import {runNivaranAgents} from "@/lib/mock-agent";
export async function POST(request:Request){
  try{
    const body=await request.json();
    const story=typeof body.story==="string"?body.story:"";
    if(!story.trim()) return NextResponse.json({error:"Please provide the investor's story."},{status:400});
    return NextResponse.json({ok:true,case:runNivaranAgents(story)});
  }catch{
    return NextResponse.json({error:"Unable to process the case."},{status:500});
  }
}