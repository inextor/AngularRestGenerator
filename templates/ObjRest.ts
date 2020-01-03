import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders,HttpParams,HttpErrorResponse } from '@angular/common/http';

export interface RestResponse<T>{
	total:number;
	data:T[];
}

export interface CsvArray{
	 [key: string]: any[];
}

/*
 * From perl operators except lk = LIKE
 * Several comparison operators impose string contexts upon their operands.
 * These are string equality (eq),
 * string inequality (ne),
 * greater than (gt),
 * less than (lt),
 * greater than or equal to (ge),
 * less than or equal to (le),
 */

export interface SearchObject<T>
{
	page?:number;
	limit?:number;

	eq?:T; //Equals to
	gt?:T; //Great than
	lt?:T; //Less than
	ge?:T; //Great or equal than
	le?:T; //less or equal than
	lk?:T; //like
	csv?:CsvArray;
	start?:T;
}


export class ObjRest<T>{
	private urlBase:string;
	private http:HttpClient;

	constructor(urlBase:string,http:HttpClient)
	{
		this.urlBase = urlBase;
		this.http = http;
	}

	private getSessionHeaders():HttpHeaders
	{
		if( localStorage.getItem('session_token') == null )
		{
			console.log("THer is no session token");
			return new HttpHeaders();
		}

		let headers = new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem('session_token'));
		return headers;
	}

	get(id:any):Observable<T>
	{
		let params = new HttpParams();
		params = params.set('id',''+id);
		return this.http.get<T>(`${this.urlBase}`,{params,headers:this.getSessionHeaders(),withCredentials:true});
	}

	getAll(search:T,extraParams:any={}):Observable<RestResponse<T>>
	{
		let params = new HttpParams();

		for(let i in extraParams )
		{
			params = params.set(i,''+extraParams[i]);
		}

		for(let i in search)
		{
			if( search[i ] )
				params = params.set(i,''+search[i]);
		}
		return this.http.get<RestResponse<T>>(`${this.urlBase}`,{params,headers:this.getSessionHeaders(),withCredentials:true});
	}

/*
export interface SearchObject<T>
{
	eq?:T; //Equals to
	gt?:T; //Great than
	lt?:T; //Less than
	ge?:T; //Great or equal than
	le?:T; //less or equal than
	lk?:T; //like
}
*/

	search(searchObj:SearchObject<T>):Observable<RestResponse<T>>
	{
		let params = new HttpParams();

		console.log('eq', searchObj.eq );
		for(let i in searchObj.eq )
			if( searchObj.eq[i] )
				params = params.set(i,''+searchObj.eq[i] );

		for(let i in searchObj.gt )
			if( searchObj.gt[i] )
				params = params.set(i+'>',''+searchObj.gt[i] );

		for(let i in searchObj.lt )
			if( searchObj.lt[i] )
				params = params.set(i+'<',''+searchObj.lt[i] );

		for(let i in searchObj.ge )
			if( searchObj.ge[i] )
				params = params.set(i+'>~',''+searchObj.ge[i] );

		for(let i in searchObj.le )
			if( searchObj.le[i] )
				params = params.set(i+'<~',''+searchObj.le[i] );

		for(let i in searchObj.csv )
			if( Array.isArray( searchObj.csv[i] ) && searchObj.csv[i].length > 0 )
				params = params.set(i+',',''+searchObj.csv[i].join(','));

		for(let i in searchObj.lk )
			if( searchObj.lk[i] )
				params = params.set(i+'~~',''+searchObj.lk[i] );

		for(let i in searchObj.start )
		{
			if( searchObj.start[i] )
				params = params.set(i+'^',''+searchObj.start[i] );
		}

		if( searchObj.page )
		{
			params = params.set( 'page', ''+searchObj.page );
		}

		if( searchObj.limit )
		{
			params = params.set( 'limit', ''+searchObj.limit );
		}

		return this.http.get<RestResponse<T>>(`${this.urlBase}`,{params,headers:this.getSessionHeaders(),withCredentials:true});
	}

	create(obj:T):Observable<T>
	{
		return this.http.post<T>(`${this.urlBase}`,obj,{headers:this.getSessionHeaders(),withCredentials:true});
	}

	update(obj:T):Observable<T>
	{
		return this.http.put<T>(`${this.urlBase}`,obj,{headers:this.getSessionHeaders(),withCredentials:true});
	}

	batchCreate(obj:T[]):Observable<T[]> {
		return this.http.post<T[]>(`${this.urlBase}`,obj,{headers:this.getSessionHeaders(),withCredentials:true});
	}

	batchUpdate(obj:T[]):Observable<T[]>
	{
		return this.http.put<T[]>(`${this.urlBase}`,obj,{headers:this.getSessionHeaders(),withCredentials:true});
	}

	delete(obj:T):Observable<T>
	{
		let params = new HttpParams();

		for(let i in obj)
		{
			params = params.set(i,''+obj[i]);
		}

		return this.http.delete<T>(`${this.urlBase}`,{params,headers:this.getSessionHeaders(),withCredentials:true});
	}
}
