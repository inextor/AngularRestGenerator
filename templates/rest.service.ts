import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,HttpParams,HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject,forkJoin, fromEvent,of} from 'rxjs';
import { map } from 'rxjs/operators';
import { ObjRest,RestResponse } from './ObjRest';
import { catchError,flatMap } from 'rxjs/operators';

TEMPLATE_IMPORT_MODELS_TEMPLATE


export class ErrorMessage{

	message:string;
	type:string;

	constructor(message:string,type:string)
	{
		this.message = message;
		this.type = type;
	}
}

export interface DateDupla
{
	date: Date;
	value: number;
}

export interface StringKey{
	[key:string]:number;
}

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
			return new HttpHeaders();
		}

		let headers = new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem('session_token'));
		return headers;
	}

	getFilePath(file_id:number):string
	{
		return this.urlBase+'/attachment.php?id='+file_id;
	}

	getImagePath(image1_id:number,image2_id:number=null,image3_id:number=null,image4_id:number=null,image5_id:number=null):string
	{
		//console.log(image1_id,image2_id,image3_id,image4_id,image5_id);

		if( image1_id )
			return this.urlBase+'/image.php?id='+image1_id;

		//console.log('dos');
		if( image2_id )
			return this.urlBase+'/image.php?id='+image2_id;

		//console.log('tres');
		if( image3_id )
			return this.urlBase+'/image.php?id='+image3_id;

		//console.log('cuatro');
		if( image4_id )
			return this.urlBase+'/image.php?id='+image4_id;

		//console.log('cinco');
		return this.urlBase+'/image.php?id='+image5_id;
	}


	/* 2019-04-03 */

	getLocalDateFromMysqlString(str:string):Date
	{
		let components = str.split(/-|:|\s/g);

		if( components.length == 3 )
			components.push('0','0','0');
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

	getMysqlStringFromLocalDate(d:Date):string
	{
		let zero = (v)=>{
			if( v > 9 )
				return ''+v;
			return '0'+v;
		};
		 let event_string = d.getFullYear()
								+'-'+zero(d.getMonth()+1)
								+'-'+zero(d.getDate() )
								+' '+zero(d.getHours() )
								+':'+zero(d.getMinutes() )
								+':'+zero(d.getSeconds() );

		return event_string;

	}

	getMysqlStringFromDate(d:Date):string
	{
		let zero = (v)=>{
			if( v > 9 )
				return ''+v;
			return '0'+v;
		};
			let event_string = d.getUTCFullYear()
							+'-'+zero(d.getUTCMonth()+1)
							+'-'+zero(d.getUTCDate())
							+' '+zero(d.getUTCHours())
							+':'+zero(d.getUTCMinutes())
							+':'+zero(d.getUTCSeconds());

		return event_string;
	}

	getErrorString( error ):string
	{
		if( error == null || error === undefined)
			return 'Error desconocido';

		if( typeof error === "string" )
			return error;

		if( 'error' in error )
		{
			if( typeof(error.error) == 'string' )
			{
			return error.error;
			}

			if( error.error && 'error' in error.error && error.error.error )
		{
			 return error.error.error;
		}
		}

		if( error instanceof HttpErrorResponse )
		{
			return error.statusText;
		}
		else
		{
			return 'Error desconocido';
		}

	}

	showSuccess(msg:string):void
	{
		this.showErrorMessage(new ErrorMessage( msg,'alert-success' ));
	}

	showError(error:any )
	{
		console.log('Error to display is',error );
		if( error instanceof ErrorMessage )
		{
			this.showErrorMessage( error );
			return;
		}

		let str_error	= this.getErrorString( error );
		this.showErrorMessage(new ErrorMessage( str_error,'alert-danger' ));
	}

	showErrorMessage(error:ErrorMessage)
	{
		this.errorBehaviorSubject.next( error);
	}
	uploadImage(file:File,is_private:boolean=false):Observable<Image>
	{
		let fd = new FormData();
		fd.append('image',file, file.name);
		fd.append('is_private', is_private?'1':'0' );
		return this.http.post(`${this.urlBase}/image.php`,fd,{headers:this.getSessionHeaders(),withCredentials:true});
	}

	uploadAttachment(file:File,is_private:boolean=false):Observable<AttachmentInfo>
	{
		let fd = new FormData();
		fd.append('file',file, file.name);
		fd.append('is_private', (is_private?'1':'0') );
		return this.http.post<AttachmentInfo>(`${this.urlBase}/attachment.php`,fd,{headers:this.getSessionHeaders(),withCredentials:true});
	}

	public hideMenu():void
	{
		document.body.classList.remove('menu_open');
	}

	toggleMenu():void
	{
		document.body.classList.toggle('menu_open');
	}

	scrollTop()
	{
		let x = document.querySelector('.page_content>.custom_scrollbar');
		if( x )
			x.scrollTo(0,0);
	}
}
