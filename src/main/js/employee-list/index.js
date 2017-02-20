import React, { Component } from 'react';
import { Employee } from '../employee';
import { css } from 'aphrodite';
import { styles } from './styles';

export class EmployeeList extends Component {
	render() {
		var employees = this.props.employees.map(employee =>
			<Employee key={employee._links.self.href} employee={employee}/>
		);

		return (
			<table className={ css(styles.table) }>
				<tbody>
					<tr>
						<th className={ css(styles.tableHeader) }>First Name</th>
						<th className={ css(styles.tableHeader) }>Last Name</th>
						<th className={ css(styles.tableHeader) }>Description</th>
					</tr>
					{employees}
				</tbody>
			</table>
		)
	}
}