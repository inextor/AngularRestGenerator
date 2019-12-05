const { toCamelCaseUpperCase,getInputField,toCamelCase,getSnakeCaseUpperCase,getInputType,cpFile  } = require('./functions.js');



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
	getModel( table )
	{
		let modelFields ={};
		return `	export interface ${table.snake_case_uppercase} {
			${model_fields}
		}`;
	}
	getImportRoutes( table )
	{
		return 'import {Save'+toCamelCaseUpperCase( table.name )+ 'Component} from \'./pages/save-'+table.dash_table_name+'/save-'+ table.dash_table_name+'.component\';\n'+
				'import {List'+toCamelCaseUpperCase( table.name )+ 'Component} from \'./pages/list-'+ table.dash_table_name+'/list-'+table.dash_table_name+'.component\';'
	}
	getRoutes( table )
	{
		return '{ path:\'list-'+table.dash_table_name+'\' , component: List'+toCamelCaseUpperCase(table.name)+'Component, pathMatch: \'full\' }\n'+
				',{ path:\'save-'+table.dash_table_name+'\' , component: Save'+toCamelCaseUpperCase(table.name)+'Component, pathMatch: \'full\' }\n'
	}

	getImportModels(models)
	{
		return models.reduce((a,b)=>{return a+'import {'+getSnakeCaseUpperCase( b )+'} from \'../../models/RestModels\''},'\n');
	}

	getObjRestImport(table)
	{
		return `import {${table.snake_case_uppercase}} from '../models/RestModels';\n`;
	}
	getObjRestDeclaration(table)
	{
		return `\tpublic ${table.snake_case}:ObjRest<${table.snake_case_uppercase}>;\n`;
	}
	getRestInitialization( table )
	{
		return '\t\tthis.'+table.name+'\t= new ObjRest<'+table.snake_case_uppercase+'>(`${this.urlBase}/'+table.name+'.php`,http);\n';
	}

	getListSearchInputs(fields,table_name, constraints )
	{
		return fields.reduce((a,field)=>
		{
			let input_field = getInputField(field,table_name+'search.eq',constraints);

			return a+`\t\t\t<div class="mt-3 mb-3">
				<label class="">${field.Field}</label>
				${input_field}
			</div>\n`
		},'\n');

	}

	getForkJoinsSave(table, fork_joins_save )
	{
		if( fork_joins_save.length == 0 )
		{
			return `if( this.${table.name}.id )
				{
				        this.rest.${table.name}.get( id ).subscribe((${table.name})=>
						{
							this.is_loading = false;
							this.${table.name}= ${table.name};
						},(error)=>
						{
							this.is_loading = false;
							this.showError( error );
						});\n
				}`;
		}
		else if( fork_joins_save.length == 1 )
		{
			return `
				if( this.${table.name}.id )
				{
					forkJoin([
						${table.fork_join_observable.join(',\n\t\t\t\t\t')}
						this.rest.${table.name}.get( id ),
					])
					.subscribe((responses)=>
					{
						let fj_index = 0;
						this.${table.name} = responses[0];
						this.${fork_joins_save[0]}_list = responses[1].datos;
					});
				}
				else
				{
					this.rest.${fork_joins_save[0]}.getAll({})
					.subscribe((response)=>
					{
						this.${fork_joins_save[0]}_list = response.datos;
					});
				}`;
		}


		let observables	 = [];
		let asignations	= [];

		fork_joins_save.forEach((b)=> observables.push( `\t\t\t\tthis.rest.${b}.getAll({})\n`) );
		fork_joins_save.forEach((b)=> assignations.push( `\t\t\tthis.${b}_list = responses[ fj_index++ ];\n` ));

		return `
				if( this.${table_name}.id )
				{
					forkJoin([
						this.rest.${table_name}.get( this.${table_name}.id )
						,${observables.join(',')}
					])
					.subscribe((responses)=>
					{
						let fj_index = 0;
						this.${table_name}= responses[fj_index++];
						${assignations.join('\n')}
					});
				}
				else
				{
					forkJoin([
						${observables.join(',')}
					])
					.subscribe((response)=>
					{
						let fj_index = 0;
						${assignations.join('\n')}
					});
				}`;
	}

	getForkJoinLists(table,fork_joins_list )
	{
		if( table.fork_joins_list.length == 1 )
		{
			return `
				this.rest.${fork_joins_list[0]}.getAll({})
				.subscribe((response)=>
				{
					this.${fork_joins_list[0]}_list = response.datos;
				});
			`;
		}


		let observables	 = [];
		let asignations	= [];

		fork_joins_list.forEach((b)=> observables.push( `\t\t\t\tthis.rest.${b}.getAll({})\n` ) );
		fork_joins_list.forEach((b)=> assignations.push( `\t\t\tthis.${b}_list = responses[ fj_index++ ];\n`) );

		return `
				forkJoin([
					${observables.join(',')}
				])
				.subscribe((responses)=>
				{
					let fj_index = 0;
					${assignations.join('\n')}
				});`;
	}

	getForkJoinDeclaration(table, fork_join_table_names )
	{
		console.log('typeof',typeof( fork_join_table_names ) );
		return fork_join_table_names.reduce((a,b)=>
		{
			return a+`\t\t\t\tthis.${b}_list:${getSnakeCaseUpperCase(b)}[] = [];\n`;
		},'');
	}

	getSaveInputs(fields,table_name,constraints)
	{
		return fields.reduce((a,field)=>
		{
			let input_field = getInputField(field,table_name,constraints);

			return a+`\t\t\t<div class="mt-3 mb-3">
				<label class="">${field.Field}</label>
				${input_field}
			</div>\n`
		},'\n');
	}
	getSearchParams(fields )
	{
		let k = 'eq,le,lt,ge,gt,lk,csv'.split(',');
		let array= [];

		fields.forEach((i)=>
		{
			let field_name = i.Field;
			if( !(field_name) )
				console.log('Field Name OBJ is',JSON.stringify( i, null,'\t'));

			k.forEach(k => array.push( 'this.'+field_name+'_search.'+field_name+'\t= "eq.'+field_name+'" in params ?params["eq.'+field_name+'"]:null;') );
		});

		return array.join('\n');
	}
	getTableListValues(fields,table_name)
	{
		return fields.reduce((a,b)=> a+'\t\t\t<td>{{'+table_name+'.'+b.Field+'}}</td>\r','');
	}

	getTableListHeaders(fields)
	{
		return fields.reduce
		(
			(a,b)=>
			{
				return a+'\t\t\t<th>'+(b.Field.replace(/_/g,' '))+'</th>\r'
			},''
		);
	}

	getImportComponent(table)
	{

	}
	//table.fork_join_declaration_list = [table.name+'_list:'+getSnakeCaseUpperCase(table.name)+'[] = [];'];

	createTableInfo( i, info )
	{
		let table = {};
		let constraints = info.constraints;
		let fields = [];

		table.name					= i;
		table.snake_case			= i;
		table.snake_case_uppercase	= getSnakeCaseUpperCase( i );
		table.camel_case			= toCamelCase( i );
		table.camel_case_uppercase	= toCamelCaseUpperCase( i );
		table.dash_table_name		= i.replace(/_/g,'-');

		table.fork_joins_save		=[];
		table.fork_joins_list		=[table.name];
		table.import_both			= [];

		table.import_both.push( table.name );

		console.log('constraints',info.constraints );
		info.contraints.forEach((k,index)=>
		{
			console.log( k );
			if( table.fork_joins_save.indexOf( K.REFERENCED_TABLE_NAME  ) == -1 )
				table.fork_joins_save.push( K.REFERENCED_TABLE_NAME );

			if( table.fork_joins_list.indexOf( K.REFERENCED_TABLE_NAME  ) == -1 )
				table.fork_joins_list.push( K.REFERENCED_TABLE_NAME );

			if( table.import_both.indexOf( K.REFERENCED_TABLE_NAME  ) == -1 )
				table.import_both( K.REFERENCED_TABLE_NAME );
		});


		let model_fields = '';

		table.search_params			= this.getSearchParams( info.fields );
		table.table_list_values		= this.getTableListValues( info.fields, table.name );
		table.table_list_headers	= this.getTableListHeaders( info.fields );
		table.table_save_inputs		= this.getSaveInputs( info.fields, table.name );
		table.search_fields			= this.getListSearchInputs( info.fields, table.name,table.constraints );

		table.import_models			= this.getImportModels( table.import_both );

		table.fork_joins_save_string  	= this.getForkJoinsSave(table, table.fork_joins_save );
		table.fork_joins_list_string	= this.getForkJoinLists(table, table.fork_joins_list );

		table.fork_join_declaration_list 	= this.getForkJoinDeclaration( table,table.fork_joins_list );
		table.fork_join_declaration_save	= this.getForkJoinDeclaration( table,table.fork_joins_save );
		return table;
	}
}

