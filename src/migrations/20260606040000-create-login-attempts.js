'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('login_attempts', {
      id_attempt: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_company: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'companies', key: 'id_company' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      successful: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: false,
      },
      attempt_date: {
        type: Sequelize.DATE,
        allowNull: false,
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
