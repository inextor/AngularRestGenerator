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
				'import {List'+toCamelCaseUpperCase( table.name )+ 'Component} from \'./pages/list-'+ table.dash_table_name+'/list-'+table.dash_table_name+'.component\';\n'
	}
	getRoutes( table )
	{
		return '{ path:\'list-'+table.dash_table_name+'\' , component: List'+toCamelCaseUpperCase(table.name)+'Component, pathMatch: \'full\' }\n'+
				',{ path:\'save-'+table.dash_table_name+'\' , component: Save'+toCamelCaseUpperCase(table.name)+'Component, pathMatch: \'full\' }\n'
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
		return `\tpublic ${table.snake_case}:ObjRest<${table.snake_case_uppercase}>;\n`;
	}
	getRestInitialization( table )
	{
		return '\t\tthis.'+table.name+'\t= new ObjRest<'+table.snake_case_uppercase+'>(`${this.urlBase}/'+table.name+'.php`,http);\n';
	}

	getListSearchInputs(fields,table_name, contraints )
	{
		return fields.reduce((a,field)=>
		{
			let input_field = getInputField(field,table_name+'search.eq',contraints);

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
						this.rest.${table.name}.get( id ),
						this.rest.${fork_joins_save[0]}.getAll({})
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
		let assignations	= [];

		fork_joins_save.forEach((b)=> observables.push( `\t\t\t\tthis.rest.${b}.getAll({})\n`) );
		fork_joins_save.forEach((b)=> assignations.push( `\t\t\tthis.${b}_list = responses[ fj_index++ ];\n` ));

		return `
				if( this.${table.name}.id )
				{
					forkJoin([
						this.rest.${table.name}.get( this.${table.name}.id )
						,${observables.join(',')}
					])
					.subscribe((responses)=>
					{
						let fj_index = 0;
						this.${table.name}= responses[fj_index++];
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
		let assignations	= [];

		fork_joins_list.forEach((b)=> observables.push( `\n\t\t\t\tthis.rest.${b}.getAll({})` ) );
		fork_joins_list.forEach((b)=> assignations.push( `this.${b}_list = responses[ fj_index++ ];`) );

		return `
			forkJoin([
				${observables.join(',')}
			])
			.subscribe((responses)=>
			{
				let fj_index = 0;
				${assignations.join('\n\t\t\t\t')}
			});`;
	}

	getForkJoinDeclaration(table, fork_join_table_names )
	{
		//console.log('typeof',typeof( fork_join_table_names ) );
		return fork_join_table_names.reduce((a,b)=>
		{
			return a+`\tthis.${b}_list:${getSnakeCaseUpperCase(b)}[] = [];\n`;
		},'\n');
	}

	getSaveInputs(fields,table_name,contraints)
	{
		return fields.reduce((a,field)=>
		{
			let input_field = getInputField(field,table_name,contraints);

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
			//if( !(field_name) )
			//	console.log('Field Name OBJ is',JSON.stringify( i, null,'\t'));

			k.forEach(k => array.push( 'this.'+field_name+'_search.'+field_name+'\t= "'+k+'.'+field_name+'" in params ?params["'+k+'.'+field_name+'"]:null;') );
		});

		return array.join('\n\t\t\t');
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
		let contraints = info.contraints;
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

		//console.log('contraints',Object.keys(info ) );
		info.contraints.forEach((k,index)=>
		{
			//console.log( k );
			if( table.fork_joins_save.indexOf( k.REFERENCED_TABLE_NAME  ) == -1 )
				table.fork_joins_save.push( k.REFERENCED_TABLE_NAME );

			if( table.fork_joins_list.indexOf( k.REFERENCED_TABLE_NAME  ) == -1 )
				table.fork_joins_list.push( k.REFERENCED_TABLE_NAME );

			if( table.import_both.indexOf( k.REFERENCED_TABLE_NAME  ) == -1 )
				table.import_both.push( k.REFERENCED_TABLE_NAME );
		});


		let model_fields = '';

		table.search_params			= this.getSearchParams( info.fields );
		table.table_list_values		= this.getTableListValues( info.fields, table.name );
		table.table_list_headers	= this.getTableListHeaders( info.fields );
		table.table_save_inputs		= this.getSaveInputs( info.fields, table.name );
		table.search_fields			= this.getListSearchInputs( info.fields, table.name, contraints );

		table.import_models			= this.getImportModels( table.import_both );

		table.fork_joins_save_string  	= this.getForkJoinsSave(table, table.fork_joins_save );
		table.fork_joins_list_string	= this.getForkJoinLists(table, table.fork_joins_list );

		table.fork_join_declaration_list 	= this.getForkJoinDeclaration( table,table.fork_joins_list );
		table.fork_join_declaration_save	= this.getForkJoinDeclaration( table,table.fork_joins_save );
		return table;
	}
}

