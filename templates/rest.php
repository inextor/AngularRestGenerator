<?php
namespace CENTRO_MEDICO;

include_once( __DIR__.'/app.php' );
include_once( __DIR__.'/akou/src/ArrayUtils.php');
include_once( __DIR__.'/SuperRest.php');
use \akou\Utils;
use \akou\DBTable;
use \akou\RestController;
use \akou\ArrayUtils;
class Service extends SuperRest
{
	function get()
	{
		session_start();
		App::connect();
		$this->setAllowHeader();

		$constraints = $this->getAllConstraints( {{TABLE_NAME}}::getAllProperties() );

		$constraints_str = count( $constraints ) > 0 ? join(' AND ',$constraints ) : '1';
		$paginacion = $this->getPaginationInfo($_GET['page'],$_GET['limit'],50);

		$sql_{{TABLE_NAME}}s	= 'SELECT SQL_CALC_FOUND_ROWS {{TABLE_NAME}}.*
			FROM `{{TABLE_NAME}}`
			WHERE '.$constraints_str.'
			LIMIT '.$paginacion->limit.'
			OFFSET '.$paginacion->offset;
		$info	= DBTable::getArrayFromQuery( $sql_{{TABLE_NAME}}s );
		$total	= DBTable::getTotalRows();
		return $this->sendStatus( 200 )->json(array("total"=>$total,"data"=>$info));
	}
	function post()
	{
		$this->setAllowHeader();
		$params = $this->getMethodParams();
		app::connect();

		${{TABLE_NAME}} = new {{TABLE_NAME}}();
		${{TABLE_NAME}}->assignFromArray( $params );

		if( !${{TABLE_NAME}}->insertDb() )
		{
			return $this->sendStatus( 400 )->json(array('error'=>'Please Check your parameters','dev'=>${{TABLE_NAME}}->_conn->error,'sql'=>${{TABLE_NAME}}->getLastQuery()));
		}
		return $this->sendStatus( 200 )->json(${{TABLE_NAME}}->toArray());
	}
	function put()
	{
		session_start();
		App::connect();
		$params = $this->getMethodParams();
		${{TABLE_NAME}} = new {{TABLE_NAME}}();
		${{TABLE_NAME}}->id = $params['id'];
		if( ${{TABLE_NAME}}->load(true) )
		{
			${{TABLE_NAME}}->updateDb();
		}
		return $this->sendStatus(200)->json( ${{TABLE_NAME}}->toArray() );
	}
}
$l = new Service();
$l->execute();
