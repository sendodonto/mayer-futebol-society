export class ClientError extends Error {constructor(message:string,public status:number){super(message);}}
export async function api<T>(path:string,method='GET',data?:unknown,signal?:AbortSignal):Promise<T> {
 const res=await fetch('/api/'+path,{method,credentials:'same-origin',headers:data?{'Content-Type':'application/json'}:undefined,body:data?JSON.stringify(data):undefined,signal});
 const body=await res.json();if(!res.ok)throw new ClientError((body as {error?:string}).error||'Não foi possível concluir a solicitação.',res.status);return body as T;
}
