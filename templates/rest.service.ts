import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,HttpParams,HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { } from '../models/Respuestas';
import {ObjRest} from './ObjRest';

TEMPLATE_IMPORT_MODELS_TEMPLATE

@Injectable({
	providedIn: 'root'
})

export class RestService {

	urlBase:string = '';


	TEMPLATE_OBJ_REST_DECLARATION


	constructor(private http: HttpClient)
	{
		//Produccion por cambiarx`x
		this.urlBase = 'http://';

		if( window.location.hostname.indexOf('127.0.0.1' ) == 0 )
			this.urlBase = 'http://hospital.nextor.mx';

		if( window.location.hostname.indexOf('localhost') == 0 )
			this.urlBase = 'http://127.0.0.1/CentroMedico';

		TEMPLATE_OBJ_REST_INITIALIZATION
	}

	uploadImage(file:File,es_privada:boolean=false):Observable<Imagen>
	{
		let fd = new FormData();
		fd.append('image',file, file.name);
		fd.append('is_privada', es_privada?'1':'0' );
		return this.http.post(`${this.urlBase}/imagen.php`,fd,{headers:this.getSessionHeaders(),withCredentials:true});
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