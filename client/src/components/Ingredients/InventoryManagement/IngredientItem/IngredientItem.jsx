import React from 'react';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './IngredientItem.module.css';

const IngredientItem = ({ ingredient, onEdit, onDelete }) => {
  const { id, name, price_per_unit, quantity, priority } = ingredient;
  
  // Determine priority level display
  const getPriorityLabel = (priority) => {
    switch(parseInt(priority)) {
      case 1: return { label: 'High', className: styles.highPriority };
      case 2: return { label: 'Medium', className: styles.mediumPriority };
      case 3: return { label: 'Low', className: styles.lowPriority };
      default: return { label: 'Normal', className: styles.normalPriority };
    }
  };
  
  const priorityStatus = getPriorityLabel(priority);
  
  return (
    <div className={styles.item}>
      <div className={styles.details}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.id}>ID: {id}</p>
      </div>
      
      <div className={styles.priceInfo}>
        <span className={styles.price}>${price_per_unit}</span>
        <span className={styles.priceUnit}>per unit</span>
      </div>
      
      <div className={styles.quantity}>
        Quantity: {quantity}
      </div>
      
      <div className={styles.statusContainer}>
        <span className={`${styles.status} ${priorityStatus.className}`}>
          {priorityStatus.label} Priority
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