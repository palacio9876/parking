// Migración: crea la tabla de usuarios del sistema (users)
'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id_user: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Identificador único del usuario',
      },
      id_company: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'companies', key: 'id_company' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Empresa a la que pertenece',
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nombre completo',
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Nombre de usuario para login',
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Hash de la contraseña',
      },
      role: {
        type: Sequelize.ENUM('admin', 'operator'),
        allowNull: false,
        comment: 'Rol: admin u operator',
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Usuario activo/inactivo',
      },
      creation_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de creación',
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
