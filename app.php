<?php

namespace AngularRestGenerator;

include_once( __DIR__.'/akou/src/LoggableException.php' );
include_once( __DIR__.'/akou/src/Utils.php' );
include_once( __DIR__.'/akou/src/DBTable.php' );
include_once( __DIR__.'/akou/src/RestController.php' );
include_once( __DIR__.'/akou/src/ArrayUtils.php' );
include_once( __DIR__.'/akou/src/Image.php' );

use \akou\DBTable;
use \akou\Utils;
use \akou\LoggableException;
use \akou\SystemException;
use \akou\ValidationException;
use \akou\RestController;
use \akou\NotFoundException;

date_default_timezone_set('UTC');
//error_reporting(E_ERROR | E_PARSE);
//Utils::$DEBUG 				= TRUE;
//Utils::$DEBUG_VIA_ERROR_LOG	= TRUE;
//Utils::$LOG_CLASS			= 'CENTRO_MEDICO\bitacora';
//Utils::$LOG_CLASS_KEY_ATTR	= 'titulo';
//Utils::$LOG_CLASS_DATA_ATTR	= 'descripcion';

class App
{
	const DEFAULT_EMAIL					= '';
	const LIVE_DOMAIN_PROTOCOL			= 'http://';
	const LIVE_DOMAIN					= '';
	const DEBUG							= FALSE;
	const APP_SUBSCRIPTION_COST			= '20.00';

	public static $GENERIC_MESSAGE_ERROR	= 'Please verify details and try again later';
	public static $image_directory 		= '../../users_images';
	public static $is_debug				= false;

	public static function connect($database_name)
	{
		DBTable::$_parse_data_types = TRUE;

		$__user		 = 'root';
		$__password	 = 'asdf';
		$__db		 = $database_name;
		$__host		 = '127.0.0.1';
		$__port		 = '3306';
		app::$is_debug	= true;


		$mysqli = new \mysqli($__host, $__user, $__password, $__db, $__port );
		if( $mysqli->connect_errno )
		{
			echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
			exit();
		}

		$mysqli->query("SET NAMES 'utf8';");
		$mysqli->query("SET time_zone = '+0:00'");
		$mysqli->set_charset('utf8');

		DBTable::$connection				= $mysqli;
		static::createSchemaJson( $__db );
	}

	public static function createSchemaJson($database_name)
	{
		$tables			= DBTable::getArrayFromQuery('SHOW TABLES');
		$database_info	= array();

		foreach($tables as $table)
		{
			$table_name			= $table['Tables_in_'.$database_name ];
			//$constraints		= getJsonDBStructure($database_name,$name);
			$sql_constraints 	= 'SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE CONSTRAINT_SCHEMA="'.$database_name.'" AND TABLE_NAME="'.$table_name.'" AND REFERENCED_COLUMN_NAME IS NOT NULL';
			$constraints 		= DBTable::getArrayFromQuery( $sql_constraints );

			$fields_info		= DBTable::getArrayFromQuery('DESCRIBE `'.$table_name.'`;');
			$database_info[$table_name]	= array( 'contraints'=>$constraints, 'fields'=>$fields_info);

		}

		echo json_encode( $database_info );
	}
}
app::connect($argv[1]);

