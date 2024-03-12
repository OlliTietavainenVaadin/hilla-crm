import ContactsView from 'Frontend/views/contacts/ContactsView.js';
import MainLayout from 'Frontend/views/MainLayout.js';
import CompanyView from 'Frontend/views/companies/CompanyView.js';
import React from 'react';
import {createBrowserRouter, RouteObject} from 'react-router-dom';
import AutoGridView from "Frontend/views/autogrid/AutoGridView";

export const routes = [
    {
        element: <MainLayout/>,
        handle: {title: 'Hilla CRM'},
        children: [
            {path: '/', element: <ContactsView/>, handle: {title: 'Contacts'}},
            {path: '/autogrid', element: <AutoGridView/>, handle: {title: 'AutoGrid'}},
            {path: '/companies', element: <CompanyView/>, handle: {title: 'Companies (TreeGrid)'}},
        ],
    },
] as RouteObject[];

export default createBrowserRouter(routes);
