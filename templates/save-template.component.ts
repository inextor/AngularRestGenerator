import { Component, OnInit } from '@angular/core';
import { RestService } from '../../services/rest.service';
import {Router,ActivatedRoute} from "@angular/router";
import { Tipo_Precio, Usuario } from '../../models/Modelos';

@Component({
	selector: 'app-save-DASH_TABLE_NAME',
	templateUrl: './save-DASH_TABLE_NAME.component.html',
	styleUrls: ['./save-DASH_TABLE_NAME.component.css']
})
export class SaveTABLE_NAME_CAMEL_CASEComponent implements OnInit {

	TABLE_NAME:SNAKE_CASE_UPPERCASE = {
	};

	ngOnInit()
	{
		this.route.paramMap.subscribe( params =>
		{
			let id = params.get('id') ==null ? null : parseInt(params.get('id') );

			if( id != null )
			{
				this.is_loading = true;
				this.rest.TABLE_NAME.get( id ).subscribe((TABLE_NAME)=>
				{
					this.is_loading = false;
					this.TABLE_NAME = TABLE_NAME;
				}, (error) =>
				{
					this.showError(error);
					this.is_loading = false;
				});
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
			});
		}
		else
		{
			this.rest.TABLE_NAME.create( this.TABLE_NAME ).subscribe((TABLE_NAME)=>{
				this.is_loading = false;
				this.router.navigate(['/list-DASH_TABLE_NAME']);
			});
		}
	}
}
