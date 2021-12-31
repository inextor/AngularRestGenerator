import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { forkJoin } from 'rxjs';
TEMPLATE_MODEL_IMPORTS

@Component({
	selector: 'app-save-TABLE_NAME_DASH',
	templateUrl: './save-TABLE_NAME_DASH.component.html',
	styleUrls: ['./save-TABLE_NAME_DASH.component.css']
})
export class SaveTABLE_NAME_CAMEL_CASE_UPPERCASEComponent extends BaseComponent implements OnInit {

	TABLE_NAME:Partial<TABLE_NAME_SNAKE_CASE_UPPERCASE>	= {};

	FORK_JOINS_DECLARATION_SAVE

	ngOnInit()
	{
		this.route.paramMap.subscribe( params =>
		{
			//this.company = this.rest.getCompanyFromSession();

			TEMPLATE_ID_ASSIGNATION

			FORK_JOINS_SAVE
		});
	}

	save()
	{
		this.is_loading = true;

		if( this.TABLE_NAME.id	)
		{
			this.subs.sink	= this.rest.TABLE_NAME.update( this.TABLE_NAME ).subscribe((TABLE_NAME)=>{
				this.is_loading = false;
				this.showSuccess('TABLE_NAME_SPACES se actualizo exitosamente');
				this.location.back();
			},(error)=>this.showError(error));
		}
		else
		{
			this.subs.sink	= this.rest.TABLE_NAME.create( this.TABLE_NAME ).subscribe((TABLE_NAME)=>{
				this.is_loading = false;
				this.showSuccess('TABLE_NAME_SPACES se guardo exitosamente');
				this.location.back();
			},(error)=>this.showError(error));
		}
	}
}
