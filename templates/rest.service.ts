import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,HttpParams,HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject,forkJoin, fromEvent,of} from 'rxjs';
import { map } from 'rxjs/operators';
import { ObjRest,RestResponse } from './ObjRest';
import { catchError,flatMap } from 'rxjs/operators';

TEMPLATE_IMPORT_MODELS_TEMPLATE

@Injectable({
	providedIn: 'root'
})

export class RestService {

	urlBase:string = '';
	public keyUpObserver:Observable<KeyboardEvent>;
	public errorBehaviorSubject: BehaviorSubject<ErrorMessage>;
	public errorObservable:Observable<ErrorMessage>;


TEMPLATE_OBJ_REST_DECLARATION


	constructor(private http: HttpClient)
	{
		//Produccion por cambiarx`x
		this.urlBase = 'http://';
		this.keyUpObserver = fromEvent<KeyboardEvent>( window.document.body, 'keyup' );

		this.errorBehaviorSubject = new BehaviorSubject<ErrorMessage>(null);
		this.errorObservable = this.errorBehaviorSubject.asObservable();

		if( window.location.hostname.indexOf('127.0.0.1' ) == 0 )
			this.urlBase = 'http://127.0.0.1/rest_test';

		if( window.location.hostname.indexOf('localhost') == 0 )
			this.urlBase = 'http://127.0.0.1/rest_test';




TEMPLATE_OBJ_REST_INITIALIZATION
	}

	//uploadImage(file:File,es_privada:boolean=false):Observable<Image>
	//{
	//	let fd = new FormData();
	//	fd.append('image',file, file.name);
	//	fd.append('is_privada', es_privada?'1':'0' );
	//	return this.http.post(`${this.urlBase}/imagen.php`,fd,{headers:this.getSessionHeaders(),withCredentials:true});
	//}

	getSessionHeaders()
	{
		if( localStorage.getItem('session_token') == null )
		{
			console.log("THer is no session token");
			return new HttpHeaders();
		}

		let headers = new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem('session_token'));
		return headers;
	}


	getLocalDateFromMysqlString(str:string)
	{
		let components = str.split(/-|:|\s/g);
		let d = new Date(parseInt( components[0] ), //Year
				parseInt(components[1])-1, //Month
				parseInt(components[2]), //Day
				parseInt(components[3]), //Hour
				parseInt(components[5])) //Minutes
		return d;
	}

	getDateFromMysqlString(str:string):Date
	{
		let components = str.split(/-|:|\s/g);

				let utcTime = Date.UTC(
						parseInt(components[0]),
						parseInt(components[1])-1,
						parseInt(components[2]),
						parseInt(components[3]),
						parseInt(components[5])
				);

		let d = new Date();
		d.setTime( utcTime );

		return d;
	}

	getMysqlStringFromLocaDate(d:Date):string
	{
		 let event_string = d.getFullYear()
								+'-'+(d.getMonth()+1)
								+'-'+d.getDate()
								+' '+d.getHours()
								+':'+d.getMinutes()
								+':'+d.getSeconds();

		return event_string;

	}

	getMysqlStringFromDate(d:Date):string
	{
			let event_string = d.getUTCFullYear()
								+'-'+(d.getUTCMonth()+1)
								+'-'+d.getUTCDate()
								+' '+d.getUTCHours()
								+':'+d.getUTCMinutes()
								+':'+d.getUTCSeconds();

		return event_string;
	}

	getErrorMessage( error )
	{
		if( error == null || error === undefined)
			return 'Error desconocido';

		if( typeof( error.error ) === "string" )
			return error.error;

		console.log( error );

		if( 'error' in error &&  typeof(error.error) !== "string" && 'error' in error.error )
		{
			 return error.error.error;
		}
		else if( error instanceof HttpErrorResponse )
		{
			return error.statusText;
		}
	}
}
