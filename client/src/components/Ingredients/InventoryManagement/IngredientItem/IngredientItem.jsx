import React from 'react';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './IngredientItem.module.css';

const IngredientItem = ({ ingredient, onEdit, onDelete }) => {
  const { id, name, category, quantity, unit, status } = ingredient;
  
  return (
    <div className={styles.item}>
      <div className={styles.details}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.category}>{category}</p>
      </div>
      
      <div className={styles.quantity}>
        {quantity} {unit}
      </div>
      
      <div className={styles.statusContainer}>
        <span className={`${styles.status} ${status === 'Low Stock' ? styles.lowStock : styles.inStock}`}>
          {status}
        </span>
      </div>
      
      <div className={styles.actions}>
        <button className={styles.actionButton} onClick={() => onEdit(id)}>
          <EditOutlined />
        </button>
        <button className={styles.actionButton} onClick={() => onDelete(id)}>
          <DeleteOutlined />
        </button>
      </div>
    </div>
  );
};

export default IngredientItem;