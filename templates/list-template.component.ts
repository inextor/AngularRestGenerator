import { Component, OnInit } from '@angular/core';
import { RestService } from '../../services/rest.service';
import { SearchObject } from '../../services/Rest';
import { Router,ActivatedRoute } from "@angular/router"
import { BaseComponent } from '../base/base.component';
import { Location } from	'@angular/common';
import { forkJoin } from 'rxjs';
import { withLatestFrom} from 'rxjs/operators';
import { of } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { StringDictionary } from '../../models/models';

TEMPLATE_MODEL_IMPORTS

@Component({
	selector: 'app-list-TABLE_NAME_DASH',
	templateUrl: './list-TABLE_NAME_DASH.component.html',
	styleUrls: ['./list-TABLE_NAME_DASH.component.css']
})

export class ListTABLE_NAME_CAMEL_CASE_UPPERCASEComponent extends BaseComponent implements OnInit {
	file:File = null;
	show_import:boolean = false;
	TABLE_NAME_search:SearchObject<TABLE_NAME_SNAKE_CASE_UPPERCASE> = { };
	search_extra:StringDictionary<string> = { };
	TABLE_NAME_list:TABLE_NAME_SNAKE_CASE_UPPERCASE[] = [];

	FORK_JOINS_DECLARATION_LIST



	ngOnInit()
	{
		this.path = '/list-TABLE_NAME_DASH';

		this.route.queryParamMap.subscribe((queryParamMap) =>
		{
			let fields = [ TEMPLATE_FIELDS_NAMES ];
			this.TABLE_NAME_search = this.getSearch(queryParamMap, fields );
			let extra_keys:Array<string> = []; //['search_param1','project_id','some_id'];
            this.search_extra = this.getSearchExtra(queryParamMap, extra_keys);

			this.titleService.setTitle('TABLE_NAME');
			this.is_loading = true;
			this.currentPage = this.TABLE_NAME_search.page;

			FORK_JOINS_LIST
		});
	}

	onFileChanged(event)
	{
		if (event.target.files.length)
		{
			this.file = event.target.files[0];
		}
	}

	uploadFile()
	{
		this.is_loading = true;
		this.rest.xlsx2json( this.file,[TEMPLATE_FIELDS_NAMES]).then((json)=>
		{
			//Filter json then upload
			this.subs.sink	= this.rest.TABLE_NAME.batchUpdate(json).subscribe((result)=>
			{
				if( this.TABLE_NAME_list.length == 0 )
				{
					this.setPages( 0, result.length );
					this.TABLE_NAME_list = result.slice(0,this.pageSize);
				}
				this.is_loading =  false;
                this.show_import = false;
                this.showSuccess('Imported succesfully '+result.length+' items');

			},(error)=>this.showError(error));
		});
	}

	exportFile()
	{
		this.is_loading = true;
		this.subs.sink	= this.rest.TABLE_NAME.search({limit:100000}).subscribe((response)=>
		{
			this.rest.array2xlsx(response.data,'TABLE_NAME.xlsx',[TEMPLATE_FIELDS_NAMES])
			this.is_loading = false;
		},(error)=>this.showError(error));
	}
}
