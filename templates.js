const { toCamelCaseUpperCase,getInputField,toCamelCase,getSnakeCaseUpperCase,getInputType,cpFile,getLabelString  } = require('./functions.js');

module.exports = class Template
{
	constructor()
	{

	}

	//getSearchFields(fields)
	//{
	//	let table = {};
	//	table.template_save_inputs.push(`\t\t\t<div class="mt-3 mb-3">
	//			<label class="">${field.name}</label>
	//			${input_field}
	//		</div>\n`);
	//}

	getModel( table, field_str )
	{
		let modelFields ={};
		return `export interface ${table.snake_case_uppercase}{
	${field_str}
}`;
	}
	getImportRoutes( table )
	{
		return 'import {Save'+toCamelCaseUpperCase( table.name )+ 'Component} from \'./pages/save-'+table.dash_table_name+'/save-'+ table.dash_table_name+'.component\';\n'+
				'import {List'+toCamelCaseUpperCase( table.name )+ 'Component} from \'./pages/list-'+ table.dash_table_name+'/list-'+table.dash_table_name+'.component\';\n'+
				'import {View'+toCamelCaseUpperCase( table.name )+ 'Component} from \'./pages/view-'+ table.dash_table_name+'/view-'+table.dash_table_name+'.component\';\n'
	}
	getRoutes( table )
	{
		return '{ path:\'list-'+table.dash_table_name+'\' , component: List'+toCamelCaseUpperCase(table.name)+'Component, pathMatch: \'full\',canActivate:[AuthGuard] }\n'+
				',{ path:\'add-'+table.dash_table_name+'\' , component: Save'+toCamelCaseUpperCase(table.name)+'Component, pathMatch: \'full\',canActivate:[AuthGuard] }\n'+
				',{ path:\'edit-'+table.dash_table_name+'/:id\' , component: Save'+toCamelCaseUpperCase(table.name)+'Component, pathMatch: \'full\',canActivate:[AuthGuard] }\n'+
				',{ path:\'view-'+table.dash_table_name+'/:id\' , component: View'+toCamelCaseUpperCase(table.name)+'Component, pathMatch: \'full\',canActivate:[AuthGuard] }\n'
	}

	getImportModels(models)
	{
		return models.reduce((a,b)=>{return a+'import {'+getSnakeCaseUpperCase( b )+'} from \'../../models/RestModels\';\n'},'\n');
	}

	getObjRestImport(table)
	{
		return `import {${table.snake_case_uppercase}} from '../models/RestModels';\n`;
	}
	getObjRestDeclaration(table)
	{
		return `\tpublic ${table.snake_case}:Rest<${table.snake_case_uppercase},${table.snake_case_uppercase}> = this.initRest('${table.snake_case}');\n`;
	}
	getRestInitialization( table )
	{
		return '\t\tthis.'+table.name+'\t= this.initRest(\''+table.name+'\');\n';
	}

	getForkJoinsSave(table, fork_joins_save )
	{
		if( fork_joins_save.length == 0 )
		{
			return `if( params.has('id') )
				{
					this.is_loading = true;
				    this.subs.sink	= this.rest.${table.name}.get( params.get('id') ).subscribe((${table.name})=>
					{
						this.is_loading = false;
						this.${table.name}= ${table.name};
					},(error)=>this.showError( error ));
				}`;
		}
		else if( fork_joins_save.length == 1 )
		{
			return `
				this.is_loading = true;

				if( params.has('id') )
				{
					this.subs.sink = forkJoin({
						${table.name} : this.rest.${table.name}.get(  params.get('id')  ),
						${ fork_joins_save[0]} : this.rest.${fork_joins_save[0]}.search({})
					})
					.subscribe((responses)=>
					{
						this.${table.name} = responses.${table.name};
						this.${fork_joins_save[0]}_list = responses.${fork_joins_save[0]}.data;

						this.is_loading = false;
					},(error)=>this.showError(error));
				}
				else
				{
					this.subs.sink = this.rest.${fork_joins_save[0]}.search({})
					.subscribe((response)=>
					{
						this.${fork_joins_save[0]}_list = response.data;
						this.is_loading = false;
					},(error)=>this.showError(error));
				}`;
		}


		let observables	 = [];
		let assignations_0	= [];
		let assignations_1	= [];

		fork_joins_save.forEach((b)=> observables.push( `${b} : this.rest.${b}.search({})`) );
		fork_joins_save.forEach((b,index)=>{
			assignations_0.push( `this.${b}_list = responses.${b}.data;` )
			assignations_1.push( `this.${b}_list = responses.${b}.data;` )
		});


		return `
				this.is_loading = true;
				if( params.has('id') )
				{
					this.subs.sink = forkJoin({
						${table.name} : this.rest.${table.name}.get( params.get('id') ),
						${observables.join(',\n\t\t\t\t\t\t')}
					})
					.subscribe((responses)=>
					{
						this.${table.name}= responses.${table.name};
						${assignations_1.join('\n\t\t\t\t\t\t')}
						this.is_loading = false;
					},(error)=>this.showError(error));
				}
				else
				{
					this.subs.sink	= forkJoin({
						${observables.join(',\n\t\t\t\t\t\t')}
					})
					.subscribe((responses)=>
					{
						${assignations_0.join('\n\t\t\t\t\t\t')}
						this.is_loading = false;
					},(error)=>this.showError(error));
				}`;
	}

	getForkJoinLists(table,fork_joins_list )
	{
		if( table.fork_joins_list.length == 0 )
		{
			return `

				this.is_loading = true;
				this.subs.sink = this.rest.${table.name}.search(this.${table.name}_search, this.search_extra)
				.subscribe((response)=>
				{
					this.setPages( this.${table.name}_search.page, response.total );
					this.${table.name}_list = response.data;
					this.is_loading = false;
				},(error)=>this.showError(error));
			`;
		}


		let observables	 = [];
		let assignations	= [];

		fork_joins_list.forEach((b)=> observables.push( `\n\t\t\t\t${b} : this.rest.${b}.search({})` ) );
		fork_joins_list.forEach((b,index)=> assignations.push( `this.${b}_list = responses.${b}.data;`) );

		return `
			this.is_loading = true;
			this.subs.sink = forkJoin({
				${table.name} : this.rest.${table.name}.search(this.${table.name}_search,this.search_extra),${observables.join(',')}
			})
			.subscribe((responses)=>
			{
				this.${table.name}_list = responses.${table.name}.data;
				this.setPages( this.${table.name}_search.page, responses.${table.name}.total );
				${assignations.join('\n\t\t\t\t')}
				this.is_loading = false;
			},(error)=>this.showError(error));`;
	}

	getForkJoinDeclaration(table, fork_join_table_names )
	{
		return fork_join_table_names.reduce((a,b)=>
		{
			return a+`\t${b}_list:${getSnakeCaseUpperCase(b)}[] = [];\n`;
		},'\n');
	}

	getFields(fields)
	{
		let fff = [];

		fields.forEach(f=>{
			fff.push(f.Field+'?:'+getInputType( f.Type )+';');
		});

		return fff.join('\n\t');
	}

	getListSearchInputs(fields,table_name, contraints , schema )
	{
		return fields.reduce((a,field)=>
		{
			let type = getInputType( field.Type );
			let postfix = '_search.eq';

			if( type == 'string' )
				postfix = '_search.lk';

			let input_field = getInputField(field,table_name+postfix,contraints, schema );

			return a+`\t\t\t\t<div class="col-6 col-md-3 form-group">
					<label class="">${getLabelString( field.Field)}</label>
					${input_field}
				</div>\n`
		},'\n');

	}
	getSaveInputs(fields,table_name,contraints,schema)
	{
		return fields.reduce((a,field)=>
		{
			let banned_fields =
			[
				'id',
				'created',
				'updated',
				'tiempo_actualizacion',
				'tiempo_creacion',
				'created_by_user_id',
				'updated_by_user_id'
			];
			if( banned_fields.indexOf( field.Field  ) !== -1 )
				return a;

			let input_field = getInputField(field,table_name,contraints,schema);

			return a+`\t\t\t\t<div class="col-6 col-md-4">
					<label class="">${getLabelString( field.Field)}</label>
					${input_field}
				</div>\n`
		},'\n');
	}
	getSearchParams(table_name,fields )
	{
		let k = 'eq,le,lt,ge,gt,lk,csv'.split(',');
		let array= [];

		fields.forEach((i)=>
		{
			let field_name = i.Field;
			//if( !(field_name) )

			k.forEach(j => array.push( 'this.'+table_name+'_search.'+j+'.'+field_name+'\t= "'+j+'.'+field_name+'" in params ?params["'+j+'.'+field_name+'"]:null;') );
		});

		return array.join('\n\t\t\t');
	}
	getTableListValueOld(fields,table_name)
	{
		//return fields.reduce((a,b)=> a+'\t\t\t<td>{{'+table_name+'.'+b.Field+'}}</td>\r','');
		return fields.reduce((a,b)=>
		{
			if( b.Field == 'created_by_user_id' || b.Field == 'updated_by_user_id' )
				return a;

			let column = '\t\t\t<div class="col">{{'+table_name+'.'+b.Field+'}}</div>\n';
			if( b.Field == 'id' )
			{
				column = '\t\t\t<div class="col"><a [routerLink]="[\'/edit-'+(table_name.replace(/_/g,'-'))+'\','+table_name+'.id]">{{'+table_name+'.'+b.Field+'}}</a></div>\n';
			} else if( b.Field == "created"  || b.Field == "updated" || b.Field == 'tiempo_creacion' || b.Field=='tiempo_actualizacion' )
			{
				column = '\t\t\t<div class="col">{{'+table_name+'.'+b.Field+' | date: \'short\' }}</div>\n';
			}

			return a+column;
		},'');

	}

	getTableListHeaders(fields,table_name)
	{
		return fields.reduce((a,b)=>
		{
			if( b.Field == 'created_by_user_id' || b.Field == 'updated_by_user_id' )
				return a;

			let column = '\t\t\t<div class="col">{{'+table_name+'.'+b.Field+'}}</div>\n';
			if( b.Field == 'id' )
			{
				column = '\t\t\t<div class="col"><a [routerLink]="[\'/edit-'+(table_name.replace(/_/g,'-'))+'\','+table_name+'.id]">{{'+table_name+'.'+b.Field+'}}</a></div>\n';
			} else if( b.Field == "created"  || b.Field == "updated" || b.Field == 'tiempo_creacion' || b.Field=='tiempo_actualizacion' )
			{
				column = '\t\t\t<div class="col">{{'+table_name+'.'+b.Field+' | date: \'short\' }}</div>\n';
			}

			return a+column;
		},'');

	}

	getTableListHeaders(fields,table_name)
	{
		return fields.reduce((a,b)=>
		{
			if( b.Field == 'tiempo_creacion' || b.Field == 'tiempo_actualizacion')
				return a;

			if( b.Field == 'created_by_user_id' || b.Field == 'updated_by_user_id' )
				return a;

			return a+'\t\t\t\t\t\t<th>'+getLabelString( b.Field )+'</th>\n';
		},'');
	}

	getTableListValues(fields,table_name)
	{
		return fields.reduce((a,b)=>
		{
			if( b.Field == 'created_by_user_id' || b.Field == 'updated_by_user_id' )
				return a;

			if( b.Field == 'tiempo_creacion' || b.Field == 'tiempo_actualizacion')
				return a;

			if( b.Field == 'id' )
			{
				return a+'\t\t\t\t\t\t<td><a [routerLink]="[\'/edit-'+(table_name.replace(/_/g,'-'))+'\','+table_name+'.id]">{{'+table_name+'.'+b.Field+'}}</a></td>\n';
			}
			else if( b.Field == "created"  || b.Field == "updated" || b.Field == 'tiempo_creacion' || b.Field=='tiempo_actualizacion' )
			{
				return a+'\t\t\t\t\t\t<td>{{'+table_name+'.'+b.Field+' | date: \'short\' }}</td>\n';
			}
			return a+'\t\t\t\t\t\t<td>{{'+table_name+'.'+b.Field+'}}</td>\n';
		},'');
	}

	/*
	getTableListHeaders(fields)
	{
		return fields.reduce
		(
			(a,b)=>
			{
				//return a+'\t\t\t<th>'+(b.Field.replace(/_/g,' '))+'</th>\r'
				return a+'\t\t\t<div class="col">'+(b.Field.replace(/_/g,' '))+'</div>\n'
			},''
		);
	}
	*/
	getTemplateIdAssignation(table_name,fields)
	{
		//let x = fields.find(f => f.Key == 'PRI' );
		//if( x )
		//{
		//	let dataType = getInputType( x.Type );

		//	return 'this.'+table_name+'.'+x.Field+' = params.get(\''+x.Field+'\');';
		//}
		return '';
	}

	getInsertUpdateFunction(table_name)
	{
		return `
			function update${table_name}}($old_id,$newParams){
				$old = ${table_name}::get($old_id);
				if( $old == null )
					throw new ValidationException('${table_name} not found');

				$properties = ${table_name}::searchPropertiesExcept('created','updated','id','tiempo_actualizacion','tiempo_creacion');
				$old->assignationFromArray($params,$properties);
				$old->unsetEmptyValues( DBTable::UNSET_EMPTY );

				if( $old->updateDb( $properties ) )
				{

				}
			}
		`
	}

	getImportComponent(table)
	{

	}
	//table.fork_join_declaration_list = [table.name+'_list:'+getSnakeCaseUpperCase(table.name)+'[] = [];'];
	getTemplateFieldNames(fields)
	{
		let x = fields.map(f=> '"'+f.Field+'"' );
		return x.join(',');
	}
	createTableInfo( i, info, schema )
	{
		let table = {};
		let contraints = info.contraints;
		let fields = [];

		table.name					= i;
		table.snake_case			= i;
		table.snake_case_uppercase	= getSnakeCaseUpperCase( i );
		table.camel_case			= toCamelCase( i );
		table.camel_case_uppercase	= toCamelCaseUpperCase( i );
		table.dash_table_name		= i.replace(/_/g,'-');

		table.fork_joins_save		=[];
		table.fork_joins_list		=[];
		table.import_both			= [];

		table.import_both.push( table.name );

		table.arrows				= '';

		info.contraints.forEach((k,index)=>
		{



			table.arrows += k.REFERENCED_TABLE_NAME+'->'+table.name+';\n';

			if( k.REFERENCED_TABLE_NAME == 'image' || k.REFERENCED_TABLE_NAME == 'attachment' )
			{
				return;
			}

			if( table.fork_joins_save.indexOf( k.REFERENCED_TABLE_NAME  ) == -1 )
				table.fork_joins_save.push( k.REFERENCED_TABLE_NAME );

			if( table.fork_joins_list.indexOf( k.REFERENCED_TABLE_NAME  ) == -1 )
				table.fork_joins_list.push( k.REFERENCED_TABLE_NAME );

			if( table.import_both.indexOf( k.REFERENCED_TABLE_NAME  ) == -1 )
				table.import_both.push( k.REFERENCED_TABLE_NAME );
		});

		table.route_import 			= this.getImportRoutes( table );
		let field_str					= this.getFields( info.fields );
		table.model					= this.getModel( table, field_str );

		table.route					= this.getRoutes(table);

		table.search_params			= this.getSearchParams(table.name, info.fields );
		table.table_list_values		= this.getTableListValues( info.fields, table.name );
		table.table_list_headers	= this.getTableListHeaders( info.fields );
		table.table_save_inputs		= this.getSaveInputs( info.fields, table.name, contraints , schema );

		table.search_fields			= this.getListSearchInputs( info.fields, table.name, contraints, schema );

		table.import_models			= this.getImportModels( table.import_both );
		table.template_id_assignation	= this.getTemplateIdAssignation(table.name,info.fields );
		table.template_field_names		= this.getTemplateFieldNames( info.fields );

		table.fork_joins_save_string  	= this.getForkJoinsSave(table, table.fork_joins_save );
		table.fork_joins_list_string	= this.getForkJoinLists(table, table.fork_joins_list );

		table.fork_join_declaration_list 	= this.getForkJoinDeclaration( table,table.fork_joins_list );
		table.fork_join_declaration_save	= this.getForkJoinDeclaration( table,table.fork_joins_save );

		table.obj_rest_import			= `import {${table.snake_case_uppercase}} from '../models/RestModels';\n`;
		table.obj_rest_declaration		= this.getObjRestDeclaration( table );

		table.obj_rest_initialization	= '\t\tthis.'+table.snake_case+'\t= new Rest<'+table.snake_case_uppercase+','+table.snake_case_uppercase+'>(`${this.urlBase}/'+table.name+'.php`,http);\n';
		table.link_list = `<a [routerLink]="['/list-${table.dash_table_name}']" routerlinkactive="active"><i class="fas fa-tools" aria-hidden="true"></i>${table.name.replace(/-/g,' ')}</a>`;
		//table.link_list	= '<li class="nav-item"> <a class="nav-link"  routerLink="/list-'+table.dash_table_name+'" href="#" routerLinkActive="active"> <span data-feather="shopping-cart"></span> - '+(table.name.replace(/-/,' '))+'</a></li>';
		//table.link_save = '<li class="nav-item"> <a class="nav-link"  routerLink="/add-'+table.dash_table_name+'" href="#" routerLinkActive="active"> <span data-feather="shopping-cart"></span> - '+(table.name.replace(/-/,' '))+'</a></li>';
		table.link_save = `<a [routerLink]="['/add-${table.dash_table_name}']" routerlinkactive="active"><i class="fas fa-plus" aria-hidden="true"></i>${table.name.replace(/-/g,' ')}</a>`;


		return table;
	}
}

