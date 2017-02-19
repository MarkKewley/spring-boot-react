import React, { Component } from 'react';
import { css } from 'aphrodite';
import { styles } from './styles';

export class Employee extends Component {
	render() {
		return (
			<tr>
				<td className={ css(styles.tableData) } >{this.props.employee.firstName}</td>
				<td className={ css(styles.tableData) } >{this.props.employee.lastName}</td>
				<td className={ css(styles.tableData) } >{this.props.employee.description}</td>
			</tr>
		)
	}
}