<?php

class DatabaseService {
 
    private $db_host = "localhost";
    private $db_name = "algotrade_db";
    private $db_user = "admin";
    private $db_password = "Admin123!@#";
    public $conn;

    public function getConnection(){

        $this->conn = null;

        try{
            $this->conn = new PDO("mysql:host=" . $this->db_host . ";dbname=" . $this->db_name, $this->db_user, $this->db_password);

            // set the PDO error mode to exception
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        }catch(PDOException $exception){
            echo "Connection failed: " . $exception->getMessage();
        }

        return $this->conn;
    }

    public function createTables() {
        
        if($this->conn == null) return;

        // SQL statement for creating new tables
        $sqlStatements = [
            'CREATE TABLE users( 
                id              INT(11) UNSIGNED AUTO_INCREMENT,
                first_name      VARCHAR(100) NOT NULL, 
                last_name       VARCHAR(100) NOT NULL,
                email           VARCHAR(100) NOT NULL,
                password        VARCHAR(255) NOT NULL,
                reg_date        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
                PRIMARY KEY(id)
                );',
            'CREATE TABLE strategies(
                id           INT(11) UNSIGNED AUTO_INCREMENT,
                user_id      INT(11) NOT NULL,
                script_path  VARCHAR(255) NOT NULL,
                script_name  VARCHAR(255) NOT NULL,
                last_time    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
                PRIMARY KEY(id)
                );'
        ];

        // execute SQL statements
        foreach ($sqlStatements as $sql) {
            $this->conn->exec($sql);
        }
    }
}
?>