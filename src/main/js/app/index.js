import React, { Component } from 'react';
import client from './client';
import { EmployeeList } from '../employee-list';
//import { CreateDialog } from '../create-dialogue';

const ROOT = '/api';

var hasEmbeddedRel = function(entity, rel) {
    return entity._embedded && entity._embedded.hasOwnProperty(rel);
};

var traverseNext =  function(api, root, rel, arrayItem) {
    return root.then(function (response) {
        if (hasEmbeddedRel(response.entity, rel)) {
            return response.entity._embedded[rel];
        }

        if(!response.entity._links) {
            return [];
        }

        if (typeof arrayItem === 'string') {
            return api({
                method: 'GET',
                path: response.entity._links[rel].href
            });
        } else {
            return api({
                method: 'GET',
                path: response.entity._links[rel].href,
                params: arrayItem.params
            });
        }
    });
};

var follow = function(api, rootPath, relArray) {
	var root = api({
		method: 'GET',
		path: rootPath
	});

	return relArray.reduce(function(root, arrayItem) {
		var rel = typeof arrayItem === 'string' ? arrayItem : arrayItem.rel;
		return traverseNext(api, root, rel, arrayItem);
	}, root);
};


export class App extends Component {

	constructor(props) {
		super(props);
		this.state = {employees: [], attributes: [], pageSize: 2, links: {}};
		this.updatePageSize = this.updatePageSize.bind(this);
		this.onCreate = this.onCreate.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.onNavigate = this.onNavigate.bind(this);
	}

	// tag::follow-2[]
	loadFromServer(pageSize) {
		follow(client, ROOT, [
			{rel: 'employees', params: {size: pageSize}}]
		).then(employeeCollection => {
			return client({
				method: 'GET',
				path: employeeCollection.entity._links.profile.href,
				headers: {'Accept': 'application/schema+json'}
			}).then(schema => {
				this.schema = schema.entity;
				return employeeCollection;
			});
		}).done(employeeCollection => {
			this.setState({
				employees: employeeCollection.entity._embedded.employees,
				attributes: Object.keys(this.schema.properties),
				pageSize: pageSize,
				links: employeeCollection.entity._links});
		});
	}
	// end::follow-2[]

	// tag::create[]
	onCreate(newEmployee) {
		follow(client, ROOT, ['employees']).then(employeeCollection => {
			return client({
				method: 'POST',
				path: employeeCollection.entity._links.self.href,
				entity: newEmployee,
				headers: {'Content-Type': 'application/json'}
			})
		}).then(response => {
			return follow(client, root, [
				{rel: 'employees', params: {'size': this.state.pageSize}}]);
		}).done(response => {
			this.onNavigate(response.entity._links.last.href);
		});
	}
	// end::create[]

	// tag::delete[]
	onDelete(employee) {
		client({method: 'DELETE', path: employee._links.self.href}).done(response => {
			this.loadFromServer(this.state.pageSize);
		});
	}
	// end::delete[]

	// tag::navigate[]
	onNavigate(navUri) {
		client({method: 'GET', path: navUri}).done(employeeCollection => {
			this.setState({
				employees: employeeCollection.entity._embedded.employees,
				attributes: this.state.attributes,
				pageSize: this.state.pageSize,
				links: employeeCollection.entity._links
			});
		});
	}
	// end::navigate[]

	// tag::update-page-size[]
	updatePageSize(pageSize) {
		if (pageSize !== this.state.pageSize) {
			this.loadFromServer(pageSize);
		}
	}
	// end::update-page-size[]

	// tag::follow-1[]
	componentDidMount() {
		this.loadFromServer(this.state.pageSize);
	}
	// end::follow-1[]
//				<CreateDialog attributes={this.state.attributes} onCreate={this.onCreate}/>
//				<EmployeeList employees={this.state.employees}
//							  links={this.state.links}
//							  pageSize={this.state.pageSize}
//							  onNavigate={this.onNavigate}
//							  onDelete={this.onDelete}
//							  updatePageSize={this.updatePageSize}/>
	render() {
		return (
			<div>
                <EmployeeList employees = {this.state.employees} />
			</div>
		)
	}

}