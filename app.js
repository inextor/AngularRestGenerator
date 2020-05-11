const { getInputField,createDirectory,toCamelCaseUpperCase,toCamelCase,getSnakeCaseUpperCase,getInputType,cpFile  } = require('./functions.js');
const schema = require('./example.json');
const Template = require('./templates.js');

let fs = require('fs').promises;
let fso	= require('fs');

let database_name_uppercase = process.argv[2].toUpperCase();
let database_name			= process.argv[2];



template = new Template();

createDirectory('./dist/').then(()=>
{
	return Promise.all
	([
		createDirectory('./dist/')
		,createDirectory('./dist/angular')
		,createDirectory('./dist/server')
		,createDirectory('./dist/angular/pages')
		,createDirectory('./dist/angular/models')
		,createDirectory('./dist/angular/services')
		,createDirectory('./dist/angular/components')
	])
})
.then(()=>
{
	return Promise.all([
		createDirectory('./dist/angular/pages/base')
		,createDirectory('./dist/angular/components/loading')
		,createDirectory('./dist/angular/components/navigation-menu')
	]);
})
.then(()=>
{
	let promises = [];
	promises.push( fs.readFile('./templates/rest.php',{ encoding:'utf8'}));
	promises.push( fs.readFile('./templates/rest.service.ts',{encoding:'utf8'}));
	promises.push( fs.readFile('./templates/save-template.component.html',{ encoding:'utf8'}));
	promises.push( fs.readFile('./templates/save-template.component.ts',{ encoding:'utf8'}));
	promises.push( fs.readFile('./templates/list-template.component.html',{ encoding:'utf8'}));
	promises.push( fs.readFile('./templates/list-template.component.ts',{ encoding:'utf8'}));
	promises.push( fs.readFile('./templates/app-routing.module.ts',{ encoding:'utf8'}));
	promises.push( fs.readFile('./templates/navigation-menu.component.html',{encoding:'utf8'}));
	promises.push( fs.readFile('./templates/app.php',{ encoding:'utf8'}));
	promises.push( fs.readFile('./templates/SuperRest.php',{ encoding:'utf8'}));

	promises.push( fs.copyFile('./templates/ObjRest.ts','./dist/angular/services/ObjRest.ts') );
	promises.push( fs.copyFile('./templates/base.component.ts','./dist/angular/pages/base/base.component.ts'));
	promises.push( fs.copyFile('./templates/loading.component.ts','./dist/angular/components/loading/loading.component.ts'));
	promises.push( fs.copyFile('./templates/loading.component.html','./dist/angular/components/loading/loading.component.html'));

	return Promise.all( promises );
})
.then((fileContents)=>
{
	let restphp = fileContents[0];
	let restService = fileContents[1];

	return {
		restphp							: fileContents[0]
		,rest_service					: fileContents[1]
		,save_template_component_html	: fileContents[2]
		,save_template_component_ts		: fileContents[3]
		,list_template_component_html	: fileContents[4]
		,list_template_component_ts		: fileContents[5]
		,app_routing_module_ts			: fileContents[6]
		,navigation_menu_template		: fileContents[7]
		,appphp_content					: fileContents[8]
		,superRest_content				: fileContents[9]
	}
})
.then((responses)=>
{
	//console.log( responses.restphp );
	let filesPromises= [];

	let rest_imports		= '';
	let rest_declarations	= '';
	let rest_initialization	= '';
	let models_file_string	= '';

	let save_html_links		= '';
	let list_html_links		= '';

    let routes				= [];
    let routeImports		= [];
	let dot_file			= 'digraph G {\n';

	console.log('ng g c pages/base');
	console.log('ng g c components/loading');
	console.log('ng g c components/navigation-menu');
	console.log('ng g c components/modal');
	console.log('ng g c components/pagination');
	console.log('ng g c components/toast-error');
	console.log('ng g c components/image-uploader');
	console.log('ng g c components/attachment-uploader');
	console.log('ng g c pages/login');
	console.log('ng g c pages/home');
	console.log('ng g component components/header');

	for(let i in schema)
	{

		let tinfo  = template.createTableInfo( i,schema[i], schema );


		dot_file += tinfo.arrows;

		models_file_string += tinfo.model+'\n';

		if( i=='image' || i=='attachment')
			continue;


		console.log('ng g c pages/list-'+tinfo.dash_table_name );
		console.log('ng g c pages/save-'+tinfo.dash_table_name );

		routes.push( tinfo.route );
		routeImports.push( tinfo.route_import );

		let phpfile = responses.restphp.replace(/{{TABLE_NAME}}/g,tinfo.name).replace(/DATABASE_NAME_UPPERCASE/g,database_name_uppercase);
		filesPromises.push( fs.writeFile('./dist/server/'+tinfo.name+'.php',phpfile ) );


		rest_imports		+= tinfo.obj_rest_import;
		rest_declarations	+= tinfo.obj_rest_declaration;
		rest_initialization	+= tinfo.obj_rest_initialization;

		let duplas = [];

		duplas.push([ /TABLE_NAME_SPACES/g, tinfo.name.replace(/_/g,' ')]);
		duplas.push([ /TEMPLATE_SEARCH_FIELDS/g, tinfo.search_fields ]);
		duplas.push([ /TABLE_NAME_DASH/g,tinfo.dash_table_name ]);
		duplas.push([ /TABLE_NAME_SNAKE_CASE_UPPERCASE/g,tinfo.snake_case_uppercase ]);
		duplas.push([ /TABLE_NAME_CAMEL_CASE_UPPERCASE/g,tinfo.camel_case_uppercase ]);

		duplas.push([ /TEMPLATE_LIST_HEADERS/g, tinfo.table_list_headers ]);
		duplas.push([ /TEMPLATE_LIST_VALUES/g, tinfo.table_list_values ]);
		duplas.push([ /TEMPLATE_SEARCH_FIELDS/g, tinfo.search_fields ]);
		duplas.push([ /TEMPLATE_SEARCH_PARAMS/g, tinfo.search_params ]);
		duplas.push([ /TEMPLATE_SAVE_INPUTS/g, tinfo.table_save_inputs ]);
		duplas.push([ /FORK_JOINS_LIST/g,  tinfo.fork_joins_list_string ]);
		duplas.push([ /FORK_JOINS_SAVE/g,  tinfo.fork_joins_save_string ]);
		duplas.push([ /FORK_JOINS_DECLARATION_SAVE/g, tinfo.fork_join_declaration_save]);
		duplas.push([ /FORK_JOINS_DECLARATION_LIST/g, tinfo.fork_join_declaration_list ]);
		duplas.push([ /TEMPLATE_MODEL_IMPORTS/g, tinfo.import_models ]);
		duplas.push([ /TABLE_NAME/g,  tinfo.name ]);
		duplas.push([ /TEMPLATE_ID_ASSIGNATION/g, tinfo.template_id_assignation ]);
		duplas.push([ /TEMPLATE_FIELDS_NAMES/g,tinfo.template_field_names ]);
		duplas.push([ /DATABASE_NAME_UPPERCASE/g,database_name_uppercase ]);


		let list_template_component_html	= replace_template( responses.list_template_component_html, duplas );
		let list_template_content_ts		= replace_template( responses.list_template_component_ts, duplas );
		let save_template_content_ts		= replace_template( responses.save_template_component_ts, duplas );
		let save_template_content_html 		= replace_template( responses.save_template_component_html, duplas );




		filesPromises.push
		(
			Promise.all([
				createDirectory('./dist/angular/pages/list-'+tinfo.dash_table_name)
				,createDirectory('./dist/angular/pages/save-'+tinfo.dash_table_name)
			])
			.then(()=>
			{
				return Promise.all([
					fs.writeFile('./dist/angular/pages/list-'+tinfo.dash_table_name+'/list-'+tinfo.dash_table_name+'.component.ts',list_template_content_ts )
					,fs.writeFile('./dist/angular/pages/list-'+tinfo.dash_table_name+'/list-'+tinfo.dash_table_name+'.component.html',list_template_component_html)
					,fs.writeFile('./dist/angular/pages/save-'+tinfo.dash_table_name+'/save-'+tinfo.dash_table_name+'.component.ts',save_template_content_ts)
					,fs.writeFile('./dist/angular/pages/save-'+tinfo.dash_table_name+'/save-'+tinfo.dash_table_name+'.component.html',save_template_content_html)
				]);
			})
		);


		list_html_links += tinfo.link_list+'\n';
		save_html_links	+= tinfo.link_save+'\n';
	}

	dot_file += '}';

	rest_file_content = responses.rest_service
				.replace(/TEMPLATE_IMPORT_MODELS_TEMPLATE/g,rest_imports )
				.replace(/TEMPLATE_OBJ_REST_DECLARATION/g,rest_declarations )
				.replace(/TEMPLATE_OBJ_REST_INITIALIZATION/g,rest_initialization );

	//let phpfile = responses.restphp.replace(/{{TABLE_NAME}}/g,tinfo.name).replace(/DATABASE_NAME_UPPERCASE/g,database_name_uppercase);
	let appphp_content =responses.appphp_content
		.replace(/DATABASE_NAME_UPPERCASE/g,database_name_uppercase)
		.replace(/DATABASE_NAME/g,database_name);

	let superRest_content	=responses.superRest_content
		.replace(/DATABASE_NAME_UPPERCASE/g,database_name_uppercase)
		.replace(/DATABASE_NAME/g,database_name);



    let app_routing_module_ts_content = responses.app_routing_module_ts.replace(/ROUTE_IMPORT_CLASES/g,routeImports.join('\n'))
		.replace(/ROUTES_DECLARATION/g,routes.join(','))

	let navigationComponentFile = responses.navigation_menu_template
		.replace(/TEMPLATE_LIST_LINKS/,list_html_links )
		.replace(/TEMPLATE_SAVE_LINKS/,save_html_links );

	filesPromises.push( fs.writeFile('./dist/server/app.php',appphp_content) );
	filesPromises.push( fs.writeFile('./dist/server/SuperRest.php',superRest_content) );
	filesPromises.push( fs.writeFile('./dist/angular/services/rest.service.ts', rest_file_content ) );
	filesPromises.push( fs.writeFile('./dist/angular/app-routing.module.ts',app_routing_module_ts_content ) );
	filesPromises.push( fs.writeFile('./dist/angular/models/RestModels.ts', models_file_string ) );
	filesPromises.push( fs.writeFile('./dist/angular/components/navigation-menu/navigation-menu.component.html',navigationComponentFile ) );
	filesPromises.push( fs.writeFile('./dist/schema.dot', dot_file ) );

	return Promise.all( filesPromises );
})
.then(()=>
{
	console.log("SUCESS");
}
,(error)=>
{
	console.log( error );
});


function replace_template(template,duplas)
{
	let result = '';//template.replace(duplas.search,duplas.replacement);

	duplas.forEach((i,index)=>
	{
		let search = i[0];
		let replacement = i[1];

		let str = index == 0 ? template : result;
		if( str == undefined || str == null)
		{
			return;
		}
		result = str.replace( search, replacement );
	});
	return result;
}
