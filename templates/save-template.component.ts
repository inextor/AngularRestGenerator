import { Component, OnInit } from '@angular/core';
import { RestService } from '../../services/rest.service';
import { Router, ActivatedRoute } from "@angular/router";
import { BaseComponent } from '../base/base.component';
import { forkJoin } from 'rxjs';
TEMPLATE_MODEL_IMPORTS

@Component({
	selector: 'app-save-TABLE_NAME_DASH',
	templateUrl: './save-TABLE_NAME_DASH.component.html',
	styleUrls: ['./save-TABLE_NAME_DASH.component.css']
})
export class SaveTABLE_NAME_CAMEL_CASE_UPPERCASEComponent extends BaseComponent implements OnInit {

	TABLE_NAME:TABLE_NAME_SNAKE_CASE_UPPERCASE	= {};

	FORK_JOINS_DECLARATION_SAVE

	ngOnInit()
	{
		this.route.paramMap.subscribe( params =>
		{
			let id = params.get('id') ==null ? null : parseInt(params.get('id') );
			this.TABLE_NAME.id = id;

			FORK_JOINS_SAVE
		});
	}

	save()
	{
		this.is_loading = true;

		if( this.TABLE_NAME.id	)
		{
			this.rest.TABLE_NAME.update( this.TABLE_NAME ).subscribe((TABLE_NAME)=>{
				this.is_loading = false;
				this.router.navigate(['/list-TABLE_NAME_DASH']);
			},(error)=>this.showError(error));
		}
		else
		{
			this.rest.TABLE_NAME.create( this.TABLE_NAME ).subscribe((TABLE_NAME)=>{
				this.is_loading = false;
				this.router.navigate(['/list-TABLE_NAME_DASH']);
			},(error)=>this.showError(error));
		}
	}
}
