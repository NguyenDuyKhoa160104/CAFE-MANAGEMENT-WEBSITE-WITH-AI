import React from 'react';
import logo from '../../assets/logo.png';

const BrandLogo = ({ className = '', onClick = undefined }) => {
    return (
        <img 
            src={logo} 
            alt="CafeFlow" 
            className={`object-contain ${className}`}
            onClick={onClick}
            style={onClick ? { cursor: 'pointer' } : {}}
        />
    );
};

export default BrandLogo;
