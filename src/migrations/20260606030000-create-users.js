'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id_user: {
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
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('admin', 'operator'),
        allowNull: false,
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      creation_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      last_access: Sequelize.DATE,
    })

    await queryInterface.addConstraint('users', {
      fields: ['username', 'id_company'],
      type: 'unique',
      name: 'uq_username_company',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users')
  },
}
