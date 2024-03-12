import React, {useMemo} from "react";
import CompanyRecord from "Frontend/generated/com/example/application/services/CRMService/CompanyRecord";
import {Grid} from "@hilla/react-components/Grid";
import {GridTreeColumn} from "@hilla/react-components/GridTreeColumn";
import {GridColumn} from "@hilla/react-components/GridColumn";
import {VerticalLayout} from "@hilla/react-components/VerticalLayout";
import {GridDataProviderCallback, GridDataProviderParams} from "@hilla/react-components/Grid.js";
import {findChildCompanies} from "Frontend/generated/CRMService";

export default function CompanyView() {

    const treeDataProvider = useMemo(
        () =>
            async (
                params: GridDataProviderParams<CompanyRecord>,
                callback: GridDataProviderCallback<CompanyRecord>
            ) => {
                const {items, hierarchyLevelSize} = await findChildCompanies(
                    params.page,
                    params.pageSize,
                    params.parentItem ? params.parentItem.id : undefined
                );
                callback(items, hierarchyLevelSize);
            },
        []
    );

    return (<VerticalLayout>
        <h2>Companies</h2>

        <Grid
              dataProvider={treeDataProvider}
              itemHasChildrenPath="hasChildren">
            <GridTreeColumn path="id"/>
            <GridColumn path="name"/>
        </Grid>
    </VerticalLayout>)
}