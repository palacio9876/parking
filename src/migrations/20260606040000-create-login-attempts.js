// Migración: crea la tabla de intentos de inicio de sesión (login_attempts)
'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('login_attempts', {
      id_attempt: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Identificador único del intento',
      },
      id_company: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'companies', key: 'id_company' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Empresa asociada',
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Usuario intentado',
      },
      successful: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        comment: 'Indica si fue exitoso',
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: false,
        comment: 'Dirección IP del intento',
      },
      attempt_date: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha y hora del intento',
      },
    })

    await queryInterface.addIndex('login_attempts', ['username'], { name: 'idx_username' })
    await queryInterface.addIndex('login_attempts', ['ip_address'], { name: 'idx_ip_address' })
    await queryInterface.addIndex('login_attempts', ['attempt_date'], { name: 'idx_attempt_date' })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('login_attempts')
  },
}
