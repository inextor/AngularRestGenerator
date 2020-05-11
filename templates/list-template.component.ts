import { Component, OnInit } from '@angular/core';
import { RestService } from '../../services/rest.service';
import { SearchObject } from '../../services/ObjRest';
import { Router,ActivatedRoute } from "@angular/router"
import { BaseComponent } from '../base/base.component';
import { Location } from	'@angular/common';
import { forkJoin } from 'rxjs';
import { of } from 'rxjs';
import { Title } from '@angular/platform-browser';

TEMPLATE_MODEL_IMPORTS

@Component({
	selector: 'app-list-TABLE_NAME_DASH',
	templateUrl: './list-TABLE_NAME_DASH.component.html',
	styleUrls: ['./list-TABLE_NAME_DASH.component.css']
})

export class ListTABLE_NAME_CAMEL_CASE_UPPERCASEComponent extends BaseComponent implements OnInit {
	file:File = null;
	show_import:boolean = false;

	TABLE_NAME_list:TABLE_NAME_SNAKE_CASE_UPPERCASE[] = [];

	FORK_JOINS_DECLARATION_LIST

	TABLE_NAME_search:SearchObject<TABLE_NAME_SNAKE_CASE_UPPERCASE> = {


	};

	search_extra = {

	};

	ngOnInit()
	{
		this.route.queryParams.subscribe( params =>
		{
			this.TABLE_NAME_search = {
				eq: {},
				gt: {},
				ge: {},
				le: {},
				lt: {},
				lk: {},
				csv: {},
				start: {}
			};


			this.TABLE_NAME_search.limit = this.pageSize;

			this.titleService.setTitle('TABLE_NAME');

			let keys = ['eq','le','lt','ge','gt','csv','lk'];
			let fields = [ TEMPLATE_FIELDS_NAMES ]

			keys.forEach((k)=>
			{
				fields.forEach((f)=>
				{
					let field = k+"."+f;

					if( params[field ] )
					{
						this.TABLE_NAME_search[ k ][ f ] = params[field] === 'null' ? null : params[ field ];
					}
					else
					{
						this.TABLE_NAME_search[ k ][ f ] = null;
					}
				});
			});


			/*
			let extra_keys = ['parameter_extra_1','parameter_extra_2'];
			extra_keys.forEach(i=>
			{
				if( params[ 'search_extra.'+i ] )
				{
					this.search_extra[ i ] = params['search_extra.'+i ] === 'null' ? null : params[ 'search_extra.'+i ];
				}
				else
				{
					this.search_extra[ i ] = null;
				}
			});
			*/

			console.log('Search', this.TABLE_NAME_search);

			this.is_loading = true;
			this.TABLE_NAME_search.page =	'page' in params ? parseInt( params.page ) : 0;
			this.currentPage = this.TABLE_NAME_search.page;

			FORK_JOINS_LIST

		});
	}

	search()
	{
		this.is_loading = true;
		this.TABLE_NAME_search.page = 0;

		let search = {};
		let array = ['eq','le','lt','ge','gt','csv','lk'];
		for(let i in this.TABLE_NAME_search )
		{
			console.log( 'i',i,array.indexOf( i ) );
			if(array.indexOf( i ) > -1 )
			{
				for(let j in this.TABLE_NAME_search[i])
					if( this.TABLE_NAME_search[i][j] !== null && this.TABLE_NAME_search[i][j] !== 'null')
						search[i+'.'+j] = this.TABLE_NAME_search[i][j];
			}
		}

		for(let i in this.search_extra )
		{
			if( this.search_extra[ i ] !== null && this.search_extra[ i ] !== 'null' )
				search['search_extra.'+i] =  this.search_extra[ i ];
		}

		console.log( search );
		this.router.navigate(['/list-TABLE_NAME_DASH'],{queryParams: search});
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
			this.rest.TABLE_NAME.batchUpdate(json).subscribe((result)=>
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
		this.rest.TABLE_NAME.search({limit:100000}).subscribe((response)=>
		{
			this.rest.array2xlsx(response.data,'TABLE_NAME.xlsx',[TEMPLATE_FIELDS_NAMES])
			this.is_loading = false;
		},(error)=>this.showError(error));
	}



}
