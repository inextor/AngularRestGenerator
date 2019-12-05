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

	getModel( table, field_str )
	{
		let modelFields ={};
		return `	export interface ${table.snake_case_uppercase} {
			${field_str}
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
			let input_field = getInputField(field,table_name+'_search.eq',contraints);

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
						this.${fork_joins_save[0]}_list = responses[1].data;
					});
				}
				else
				{
					this.rest.${fork_joins_save[0]}.getAll({})
					.subscribe((response)=>
					{
						this.${fork_joins_save[0]}_list = response.data;
					});
				}`;
		}


		let observables	 = [];
		let assignations_0	= [];
		let assignations_1	= [];

		fork_joins_save.forEach((b)=> observables.push( `this.rest.${b}.getAll({})`) );
		fork_joins_save.forEach((b,index)=>{
			assignations_0.push( `this.${b}_list = responses[ ${index} ].data;` )
			assignations_1.push( `this.${b}_list = responses[ ${index+1} ].data;` )
		});


		return `
				if( this.${table.name}.id )
				{
					forkJoin([
						this.rest.${table.name}.get( this.${table.name}.id )
						,${observables.join('\n\t\t\t\t\t\t,')}
					])
					.subscribe((responses)=>
					{
						this.${table.name}= responses[ 0 ];
						${assignations_1.join('\n\t\t\t\t\t\t')}
					});
				}
				else
				{
					forkJoin([
						${observables.join('\n\t\t\t\t\t\t,')}
					])
					.subscribe((responses)=>
					{
						${assignations_0.join('\n\t\t\t\t\t\t')}
					});
				}`;
	}

	getForkJoinLists(table,fork_joins_list )
	{
		if( table.fork_joins_list.length == 0 )
		{
			return `
				this.rest.${table.name}.search(this.${table.name}_search)
				.subscribe((response)=>
				{
					this.${table.name}_list = response.data;
				});
			`;
		}


		let observables	 = [];
		let assignations	= [];

		fork_joins_list.forEach((b)=> observables.push( `\n\t\t\t\tthis.rest.${b}.getAll({})` ) );
		fork_joins_list.forEach((b,index)=> assignations.push( `this.${b}_list = responses[ ${index+1} ].data;`) );

		return `
			forkJoin([
				this.rest.${table.name}.search(this.${table.name}_search)
				,${observables.join(',')}
			])
			.subscribe((responses)=>
			{
				this.${table.name}_list = responses[0].data;
				${assignations.join('\n\t\t\t\t')}
			});`;
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
			fff.push(f.Field+'?\t:'+getInputType( f.Type )+';');
		});

		return fff.join('\n\t\t\t');
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
		table.fork_joins_list		=[];
		table.import_both			= [];

		table.import_both.push( table.name );

		info.contraints.forEach((k,index)=>
		{
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
		table.table_save_inputs		= this.getSaveInputs( info.fields, table.name );
		table.search_fields			= this.getListSearchInputs( info.fields, table.name, contraints );

		table.import_models			= this.getImportModels( table.import_both );

		table.fork_joins_save_string  	= this.getForkJoinsSave(table, table.fork_joins_save );
		table.fork_joins_list_string	= this.getForkJoinLists(table, table.fork_joins_list );

		table.fork_join_declaration_list 	= this.getForkJoinDeclaration( table,table.fork_joins_list );
		table.fork_join_declaration_save	= this.getForkJoinDeclaration( table,table.fork_joins_save );

		table.obj_rest_import			= `import {${table.snake_case_uppercase}} from '../models/RestModels';\n`;
		table.obj_rest_declaration		= `\tpublic ${table.snake_case}:ObjRest<${table.snake_case_uppercase}>;\n`;
		table.obj_rest_initialization	= '\t\tthis.'+table.snake_case+'\t= new ObjRest<'+table.snake_case_uppercase+'>(`${this.urlBase}/'+table.name+'.php`,http);\n';


		return table;
	}
}

