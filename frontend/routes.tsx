import ContactsView from 'Frontend/views/contacts/ContactsView.js';
import MainLayout from 'Frontend/views/MainLayout.js';
import CompanyView from 'Frontend/views/companies/CompanyView.js';
import React, {lazy} from 'react';
import {createBrowserRouter, RouteObject} from 'react-router-dom';

const AboutView = lazy(async () => import('Frontend/views/about/AboutView.js'));

export const routes = [
    {
        element: <MainLayout/>,
        handle: {title: 'Hilla CRM'},
        children: [
            {path: '/', element: <ContactsView/>, handle: {title: 'Contacts'}},
            {path: '/about', element: <AboutView/>, handle: {title: 'About'}},
            {path: '/companies', element: <CompanyView/>, handle: {title: 'Companies'}},
        ],
    },
] as RouteObject[];

export default createBrowserRouter(routes);
