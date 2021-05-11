import type { Server } from 'miragejs';

export default function (this: Server) {
  this.get('reportCollections');
  this.get('reportCollections/:id');
}
