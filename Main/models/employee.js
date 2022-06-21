const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class Employee extends Model {}

Employee.init(
    {
        id: {
            tpye: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        first_name: {
            tpye: DataTypes.STRING,
            allowNull: false,
        },
        last_name: {
            tpye: DataTypes.STRING,
            allowNull: false,
        },
        role_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: 'role',
            referencesKey: 'id'
        },
        manager_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: 'role',
            referencesKey: 'id'
        }
    },
    {
        sequelize,
        modelName: 'employee',
        freezeTableName: true,
        underscored: true
    }
)

module.exports = Employee