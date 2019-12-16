<?php

namespace AngularRestGenerator;

include_once( __DIR__.'/akou/src/LoggableException.php' );
include_once( __DIR__.'/akou/src/Utils.php' );
include_once( __DIR__.'/akou/src/DBTable.php' );
include_once( __DIR__.'/akou/src/RestController.php' );
include_once( __DIR__.'/akou/src/ArrayUtils.php' );
include_once( __DIR__.'/akou/src/Image.php' );
include_once( __DIR__.'/SuperRest.php');

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

	public static function connect()
	{
		DBTable::$_parse_data_types = TRUE;

		 if( !isset( $_SERVER['SERVER_ADDR'])  || $_SERVER['SERVER_ADDR'] =='127.0.0.1' )
		{
				$__user		 = 'root';
				$__password	 = 'asdf';
				$__db		   = 'centrosmedicos';
				$__host		 = '127.0.0.1';
				$__port		 = '3306';
				app::$is_debug	= true;
		}
		else
		{
				Utils::$DEBUG_VIA_ERROR_LOG	= FALSE;
				Utils::$LOG_LEVEL			= Utils::LOG_LEVEL_ERROR;
				Utils::$DEBUG				= FALSE;
				Utils::$DB_MAX_LOG_LEVEL	= Utils::LOG_LEVEL_ERROR;
				app::$is_debug	= false;

				$__user		 = 'test';
				$__password	 = 'asdf';
				$__db		 = 'test';
				$__host		 = '127.0.0.1';
				$__port		 = '3306';
		}

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
		DBTable::importDbSchema('CENTRO_MEDICO');
	}
}
