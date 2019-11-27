import { Component, OnInit } from '@angular/core';
import { RestService } from '../../services/rest.service';
import {Router,ActivatedRoute} from "@angular/router";
import { Tipo_Precio, Usuario } from '../../models/Modelos';
FORK_JOIN_IMPORTS

@Component({
	selector: 'app-save-DASH_TABLE_NAME',
	templateUrl: './save-DASH_TABLE_NAME.component.html',
	styleUrls: ['./save-DASH_TABLE_NAME.component.css']
})
export class SaveTABLE_NAME_CAMEL_CASEComponent implements OnInit {

	TABLE_NAME:SNAKE_CASE_UPPERCASE	= {};

	FORK_JOIN_DECLARATION

	ngOnInit()
	{
		this.route.paramMap.subscribe( params =>
		{
			let id = params.get('id') ==null ? null : parseInt(params.get('id') );

			if( id != null )
			{
				FORK_JOIN_ID
			}
			else
			{
				FORK_JOIN_CONSTRAINTS
			}
		});
	}

	save()
	{
		this.is_loading = true;

		if( this.TABLE_NAME.id	)
		{
			this.rest.TABLE_NAME.update( this.TABLE_NAME ).subscribe((TABLE_NAME)=>{
				this.is_loading = false;
				this.router.navigate(['/list-DASH_TABLE_NAME']);
			},(error)=>this.showError(error));
		}
		else
		{
			this.rest.TABLE_NAME.create( this.TABLE_NAME ).subscribe((TABLE_NAME)=>{
				this.is_loading = false;
				this.router.navigate(['/list-DASH_TABLE_NAME']);
			},(error)=>this.showError(error));
		}
	}
}
