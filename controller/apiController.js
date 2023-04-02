const { json } = require("express");
const db = require("../db");
const { v4: uuidv4 } = require("uuid");

class apiController {
  async createCompany(req, res) {
    try {
      const { company_name, admin_username, login, password } = req.body;

      if (!company_name || !admin_username || !login || !password) {
        return res.status(400).send("Заполните обязательные поля");
      }
      const existingCompany = await db.query(
        "SELECT * FROM tb_company WHERE company_name = $1",
        [company_name]
      );
      if (existingCompany.rows.length > 0) {
        return res
          .status(400)
          .send("Компания с таким названием уже существует");
      }
      const newCompany = await db.query(
        "INSERT INTO tb_company (company_name, admin_username, login, password) VALUES ($1, $2, $3, $4) RETURNING *",
        [company_name, admin_username, login, password]
      );
      res.status(200).send(newCompany.rows[0]);
    } catch (e) {
      console.log(e);
      res.status(500).send("Ошибка сервера");
    }
  }
  async companyLogin(req, res) {
    try {
      const { login, password } = req.body;

      const sql = "SELECT * FROM tb_company WHERE login = $1 AND password = $2";
      const result = await db.query(sql, [login, password]);
      console.log(111111111);
      if (result.rows.length > 0) {
        const company = result.rows[0];
        res.status(200).json({
          success: true,
          message: "Вы успешно вошли",
          company: result.rows[0],
        });
        console.log(result.rows[0]);
        console.log(222222222222);
      } else {
        res.status(401).json({
          success: false,
          message: "Неверный логин или пароль",
        });
      }
    } catch (e) {
      console.log(e);
      res.status(500).send("Ошибка сервера");
    }
  }

  async changeCompany(req, res) {
    try {
      const { company_id, company_name, login, password } = req.body;
      if (!company_id) {
        return res.status(400).send("Укажите ID компании");
      }
      const existingCompany = await db.query(
        "SELECT * FROM tb_company WHERE id = $1",
        [company_id]
      );
      if (existingCompany.rows.length === 0) {
        return res.status(400).send("Компания с указанным ID не найдена");
      }
      const updatedCompany = await db.query(
        "UPDATE tb_company SET company_name = $1, login = $2, password = $3 WHERE id = $4 RETURNING *",
        [
          company_name || existingCompany.rows[0].company_name,
          login || existingCompany.rows[0].login,
          password || existingCompany.rows[0].password,
          company_id,
        ]
      );

      res.send(updatedCompany.rows[0]);
    } catch (e) {
      console.log(e);
      res.status(500).send("Ошибка сервера");
    }
  }
  async deleteCompany(req, res) {
    try {
      const { company_id } = req.body;
      if (!company_id) {
        return res.status(400).send("Укажите ID компании");
      }
      const deletedCompany = await db.query(
        "DELETE FROM tb_company WHERE id = $1 RETURNING *",
        [company_id]
      );
      await db.query("DELETE FROM tb_company_roles WHERE company_id = $1", [
        company_id,
      ]);
      await db.query("DELETE FROM tb_company_workers WHERE company_id = $1", [
        company_id,
      ]);

      res.send(deletedCompany.rows[0]);
    } catch (e) {
      console.log(e);
      res.status(500).send("Ошибка сервера");
    }
  }

  async getCompanyRoles(req, res) {
    try {
      const { company_id } = req.query;
      if (!company_id) {
        return res.status(400).send("Укажите ID компании");
      }

      const roles = await db.query(
        "SELECT * FROM tb_company_roles WHERE company_id = $1",
        [company_id]
      );

      res.send(roles.rows);
    } catch (e) {
      console.log(e);
      res.status(500).send("Ошибка сервера");
    }
  }

  async createCompanyRole(req, res) {
    try {
      const { company_id, role_name, role_salary_for_hour } = req.body;

      if (!company_id || !role_name || !role_salary_for_hour) {
        return res.status(400).send("Заполните обязательные поля");
      }
      const result = await db.query(
        "INSERT INTO tb_company_roles (company_id, role_name, role_salary_for_hour) VALUES ($1, $2, $3) RETURNING *",
        [company_id, role_name, role_salary_for_hour]
      );

      const newRole = result.rows[0];
      res.send(newRole);
    } catch (e) {
      console.log(e);
      res.status(500).send("Ошибка сервера");
    }
  }

  async changeCompanyRole(req, res) {
    try {
      const { id, role_name, role_salary_for_hour } = req.body;
      if (!id) {
        return res.status(400).send("Укажите ID роли компании");
      }

      const result = await db.query(
        "SELECT * FROM tb_company_roles WHERE id = $1",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).send("Роль компании не найдена");
      }

      const role = result.rows[0];

      if (role_name) {
        role.role_name = role_name;
      }

      if (role_salary_for_hour) {
        role.role_salary_for_hour = role_salary_for_hour;
      }

      const updateResult = await db.query(
        "UPDATE tb_company_roles SET role_name = $1, role_salary_for_hour = $2 WHERE id = $3 RETURNING *",
        [role.role_name, role.role_salary_for_hour, role.id]
      );

      const updatedRole = updateResult.rows[0];
      res.send(updatedRole);
    } catch (e) {
      console.log(e);
      res.status(500).send("Ошибка сервера");
    }
  }

  async deleteCompanyRole(req, res) {
    const roleId = req.query.role_id;
    try {
      const deleteQuery = "DELETE FROM tb_company_roles WHERE id = $1";
      const { rowCount } = await db.query(deleteQuery, [roleId]);

      if (rowCount === 1) {
        res.status(200).json({ message: "Роль успешно удалена" });
      } else {
        res.status(404).json({ message: "Роль не найдена" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ошибка при удалении роли" });
    }
  }
  async createCompanyWorker(req, res) {
    try {
      const workerCode = uuidv4();
      const companyID = req.body.company_id;
      const workerName = req.body.worker_name;
      const workerLastName = req.body.worker_last_name;
      const companyRoleId = req.body.company_role_id;
      const sql =
        "INSERT INTO tb_company_workers (worker_code,company_id, worker_name, worker_last_name, company_role_id) VALUES ($1, $2, $3, $4, $5) RETURNING *";
      const worker = await db.query(sql, [
        workerCode,
        companyID,
        workerName,
        workerLastName,
        companyRoleId,
      ]);
      res.status(200).send(worker.rows[0]);
    } catch (e) {
      console.log(e);
      res.status(500).send("Ошибка сервера");
    }
  }
  async companyWorkerLogin(req, res) {
    try {
      const workerLogin = req.body.worker_login;
      const workerPassword = req.body.worker_password;
      console.log(workerLogin, workerPassword);
      const sql =
        "SELECT * FROM tb_company_workers WHERE worker_login = $1 AND worker_password = $2 ";

      const worker = await db.query(sql, [workerLogin, workerPassword]);
      console.log(worker);
      res.status(200).json(worker.rows[0]);
    } catch (e) {
      console.log(e);
      res.status(500).send("Ошибка сервера");
    }
  }

  async changeCompanyWorker(req, res) {
    try {
      const workerCode = req.body.worker_code;
      const workerLogin = req.body.worker_login;
      const workerPassword = req.body.worker_password;
      const sql =
        "UPDATE tb_company_workers SET worker_login = $1, worker_password = $2 WHERE worker_code = $3";
      await db.query(
        sql,
        [workerLogin, workerPassword, workerCode],
        (err, results) => {
          if (err) {
            console.log(err);
            res.status(500).send(false);
          } else {
            res.status(200).send(true);
          }
        }
      );
    } catch (e) {
      console.log(e);
      res.status(500).send(false);
    }
  }
  async getCompanyWorkerCode(req, res) {
    try {
      const workerId = req.query.worker_id;
      const sql = "SELECT worker_code FROM tb_company_workers WHERE id = $1";
      const workerCode = await db.query(sql, [workerId]);
      res.status(200).json(workerCode.rows[0]);
    } catch (e) {
      console.log(e);
      res.status(500).send(false);
    }
  }

  async getCompanyWorkers(req, res) {
    try {
      const { company_id } = req.query;
      if (!company_id) {
        return res.status(400).send("Укажите ID компании");
      }
      console.log(company_id);
      const workers = await db.query(
        `SELECT w.Id, w.worker_name, w.worker_last_name, r.role_name
        FROM tb_company_workers w
        INNER JOIN tb_company_roles r ON w.company_role_id = r.Id
        WHERE w.company_id = $1;
        `,
        [company_id]
      );

      res.send(workers.rows);
    } catch (error) {
      console.log(error);
      res.status(500).send("Ошибка при получении работников");
    }
  }
  async getCompanyWorker(req, res) {
    try {
      const workerId = req.query.worker_id;
      console.log(workerId);

      const workers = await db.query(
        `SELECT is_worked FROM tb_company_workers WHERE id = $1 
        `,
        [workerId]
      );

      res.send(workers.rows[0]);
    } catch (error) {
      console.log(error);
      res.status(500).send("Ошибка при получении работников");
    }
  }
  async deleteCompanyWorker(req, res) {
    try {
      const workerId = req.query.worker_id;
      const sql = "DELETE FROM tb_company_workers WHERE id = $1";
      await db.query(sql, [workerId]);
      res.status(200).send("Работник успешно удален");
    } catch (error) {
      console.log(error);
      res.status(500).send("Ошибка при удалении работника");
    }
  }
  async startWorking(req, res) {
    const workerId = req.body.worker_id;
    const startTime = req.body.start_time;

    try {
      const result = await db.query(
        "INSERT INTO tb_worker_hours (worker_id, start_time) VALUES ($1, $2)",
        [workerId, startTime]
      );
       await db.query(
        "UPDATE tb_company_workers SET is_worked = true WHERE Id = $1",
        [workerId]
      );
      res.send({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: "Internal server error" });
    }
  }
  async endWorking(req, res) {
    try {
      const workerId = req.body.worker_id;
      const endTime = req.body.end_time;
      
      const query =
        "UPDATE tb_worker_hours SET end_time = $1 WHERE worker_id = $2 AND end_time IS NULL";
      await db.query(query, [ endTime, workerId]);
      await db.query(
        "UPDATE tb_company_workers SET is_worked = false WHERE Id = $1",
        [workerId]
      );
      res.send("Рабочее время окончено");
    } catch (e) {
      console.error(e);
      res.status(500).send("Внутренняя ошибка сервера");
    }
  }
  async getWorkersHours(req, res) {
    try {
      const company_id = req.query.company_id;
      const year = req.query.year;
      const month = req.query.month;
      console.log(company_id, year, month);
      const sql = `SELECT 
      tw.Id,
      tw.worker_name || ' ' || tw.worker_last_name AS worker_name, 
      SUM((th.end_time - th.start_time)/3600000) AS total_hours, 
      CAST(SUM((th.end_time - th.start_time)/3600000) * CAST(tr.role_salary_for_hour AS NUMERIC) AS BIGINT) AS total_pay
    FROM tb_company_workers tw 
    INNER JOIN tb_worker_hours th ON tw.Id = th.worker_id 
    INNER JOIN tb_company_roles tr ON tw.company_role_id = tr.Id 
    WHERE tw.company_id = $1 
      AND DATE_TRUNC('month', to_timestamp(th.start_time / 1000)) = DATE_TRUNC('month', to_date($2 || '-' || $3 || '-01', 'YYYY-MM-DD')) 
    GROUP BY tw.Id, tw.worker_name, tw.worker_last_name, tr.role_salary_for_hour    
    `;

      const result = await db.query(sql, [company_id, year, month])
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
  async getWorkerHours(req, res) {
    try {
      const worker_id = req.query.worker_id;
      const year = req.query.year;
      const month = req.query.month;
      const sql = `SELECT 
      tw.worker_name, 
      tw.worker_last_name,
      tcr.role_name, 
      to_timestamp(th.start_time / 1000) AS start_time, 
      to_timestamp(th.end_time / 1000) AS end_time 
    FROM tb_company_workers tw 
    INNER JOIN tb_company_roles tcr ON tw.company_role_id = tcr.Id 
    INNER JOIN tb_worker_hours th ON tw.Id = th.worker_id 
    WHERE  tw.Id = $1 
      AND DATE_TRUNC('month', to_timestamp(th.start_time / 1000)) = DATE_TRUNC('month', to_date($2 || '-' || $3 || '-01', 'YYYY-MM-DD'))
    `;

      const result = await db.query(sql, [worker_id, year, month])
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new apiController();
