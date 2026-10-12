import networkx as nx
from typing import Dict, List, Any, Optional
from datetime import datetime
from models.schemas import GraphNode, GraphEdge, GraphData

class ThreatGraphManager:
    def __init__(self):
        self.graph = nx.MultiDiGraph()
        self._initialize_baseline()

    def _initialize_baseline(self):
        """Seed an initial active cross-domain environment."""
        pass

    def add_node(self, node_id: str, label: str, node_type: str, risk_score: float = 0.0, metadata: Dict[str, Any] = None):
        if metadata is None:
            metadata = {}
        self.graph.add_node(
            node_id,
            label=label,
            type=node_type,
            risk_score=risk_score,
            status="active",
            metadata=metadata
        )

    def add_edge(self, source: str, target: str, relation: str, is_anomalous: bool = False, weight: float = 1.0):
        self.graph.add_edge(
            source,
            target,
            relation=relation,
            timestamp=datetime.utcnow().isoformat() + "Z",
            is_anomalous=is_anomalous,
            weight=weight
        )

    def get_full_graph_data(self) -> GraphData:
        nodes = []
        for n_id, data in self.graph.nodes(data=True):
            nodes.append(GraphNode(
                id=n_id,
                label=data.get("label", n_id),
                type=data.get("type", "Entity"),
                risk_score=data.get("risk_score", 0.0),
                status=data.get("status", "active"),
                metadata=data.get("metadata", {})
            ))

        edges = []
        for u, v, k, data in self.graph.edges(data=True, keys=True):
            edges.append(GraphEdge(
                source=u,
                target=v,
                relation=data.get("relation", "CONNECTED"),
                timestamp=data.get("timestamp", datetime.utcnow().isoformat() + "Z"),
                is_anomalous=data.get("is_anomalous", False),
                weight=data.get("weight", 1.0)
            ))

        return GraphData(nodes=nodes, edges=edges)

    def get_subgraph_around_incident(self, incident_nodes: List[str], hops: int = 2) -> GraphData:
        """Extract a high-focus subgraph centered on compromised entities."""
        subgraph_node_ids = set(incident_nodes)
        for _ in range(hops):
            neighbors = set()
            for n in subgraph_node_ids:
                if self.graph.has_node(n):
                    neighbors.update(self.graph.neighbors(n))
                    neighbors.update(self.graph.predecessors(n))
            subgraph_node_ids.update(neighbors)

        sub_g = self.graph.subgraph(subgraph_node_ids)

        nodes = []
        for n_id, data in sub_g.nodes(data=True):
            nodes.append(GraphNode(
                id=n_id,
                label=data.get("label", n_id),
                type=data.get("type", "Entity"),
                risk_score=data.get("risk_score", 0.0),
                status=data.get("status", "active"),
                metadata=data.get("metadata", {})
            ))

        edges = []
        for u, v, k, data in sub_g.edges(data=True, keys=True):
            edges.append(GraphEdge(
                source=u,
                target=v,
                relation=data.get("relation", "CONNECTED"),
                timestamp=data.get("timestamp", datetime.utcnow().isoformat() + "Z"),
                is_anomalous=data.get("is_anomalous", False),
                weight=data.get("weight", 1.0)
            ))

        return GraphData(nodes=nodes, edges=edges)

    def update_node_status(self, node_id: str, new_status: str, new_risk: Optional[float] = None):
        if self.graph.has_node(node_id):
            self.graph.nodes[node_id]["status"] = new_status
            if new_risk is not None:
                self.graph.nodes[node_id]["risk_score"] = new_risk

# Global singleton
threat_graph = ThreatGraphManager()
