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

		if( isset( $_GET['id'] ) && !empty( $_GET['id'] ) )
		{
			${{TABLE_NAME}} = {{TABLE_NAME}}::get( $_GET['id']  );

			if( ${{TABLE_NAME}} )
			{
				return $this->sendStatus( 200 )->json( ${{TABLE_NAME}}->toArray() );
			}
			return $this->sendStatus( 404 )->json(array('error'=>'The element wasn\'t found'));
		}


		$constraints = $this->getAllConstraints( {{TABLE_NAME}}::getAllProperties() );

		$constraints_str = count( $constraints ) > 0 ? join(' AND ',$constraints ) : '1';
		$pagination	= $this->getPagination();

		$sql_{{TABLE_NAME}}s	= 'SELECT SQL_CALC_FOUND_ROWS {{TABLE_NAME}}.*
			FROM `{{TABLE_NAME}}`
			WHERE '.$constraints_str.'
			LIMIT '.$pagination->limit.'
			OFFSET '.$pagination->offset;
		$info	= DBTable::getArrayFromQuery( $sql_{{TABLE_NAME}}s );
		$total	= DBTable::getTotalRows();
		return $this->sendStatus( 200 )->json(array("total"=>$total,"data"=>$info));
	}
	function post()
	{
		$this->setAllowHeader();
		$params = $this->getMethodParams();
		app::connect();
		DBTable::autocommit(false );

		try
		{
			$is_assoc	= $this->isAssociativeArray( $params );
			$result		= $this->batchInsert( $is_assoc  ? array($params) : $params );
			DBTable::commit();
        	return $result;
		}
        catch(LoggableException $e)
        {
            DBTable::rollback();
            error_log("LOGABBLE");
            return $this->sendStatus( $e->code )->json(array("error"=>$e->getMessage()));
        }
        catch(Exception $e)
        {
            DBTable::rollback();
            error_log("CATCH HERE");
            return $this->sendStatus( 500 )->json(array("error"=>$e->getMessage()));
        }
	}

	function put()
    {
		$this->setAllowHeader();
		$params = $this->getMethodParams();
		app::connect();
		DBTable::autocommit( false );

		try
		{
			$is_assoc	= $this->isAssociativeArray( $params );
			$result		= $this->batchUpdate( $is_assoc  ? array($params) : $params );
			DBTable::commit();
        	return $result;
		}
        catch(LoggableException $e)
        {
            DBTable::rollback();
            error_log("LOGABBLE");
            return $this->sendStatus( $e->code )->json(array("error"=>$e->getMessage()));
        }
        catch(Exception $e)
        {
            DBTable::rollback();
            error_log("CATCH HERE");
            return $this->sendStatus( 500 )->json(array("error"=>$e->getMessage()));
        }

    }


	function batchInsert($array)
	{
		$results = array();

		foreach($array as $params )
		{
			${{TABLE_NAME}} = {{TABLE_NAME}}::createFromArray( $params );

			if( !${{TABLE_NAME}}->insert() )
			{
					throw new ValidationError('An error Ocurred please try again later',${{TABLE_NAME}}->_conn->error );
			}

			$results [] = ${{TABLE_NAME}}->toArray();
		}

		return $results;
	}

	function batchUpdate($array)
	{
		$results = array();

		foreach($array as $params )
		{
			${{TABLE_NAME}} = {{TABLE_NAME}}::createFromArray( $params );

			if( !empty( ${{TABLE_NAME}}->id ) )
			{
				${{TABLE_NAME}}->setWhereString( true );

				if( !${{TABLE_NAME}}->updateDb() )
				{
					throw new ValidationError('An error Ocurred please try again later',${{TABLE_NAME}}->_conn->error );
				}

				${{TABLE_NAME}}->load(true);

				$results [] = ${{TABLE_NAME}}->toArray();
			}
			else
			{
				if( !${{TABLE_NAME}}->insert() )
				{
					throw new ValidationError('An error Ocurred please try again later',${{TABLE_NAME}}->_conn->error );
				}

				$results [] = ${{TABLE_NAME}}->toArray();
			}
		}

		return $results;
    }
}
$l = new Service();
$l->execute();
