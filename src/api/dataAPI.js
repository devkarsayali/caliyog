import { firestoreHelpers, uploadToFirebaseStorage } from './firebase';

// Adapt Firestore generic helpers into the expected MongoDB API design pattern
const createAPI = (collectionName) => ({
  getAll: async () => {
    return await firestoreHelpers.getAll(collectionName);
  },
  getById: async (id) => {
    return await firestoreHelpers.getById(collectionName, id);
  },
  create: async (data) => {
    return await firestoreHelpers.create(collectionName, data);
  },
  update: async (id, data) => {
    return await firestoreHelpers.update(collectionName, id, data);
  },
  delete: async (id) => {
    return await firestoreHelpers.delete(collectionName, id);
  },
});

// Alias to route Cloudinary calls to Firebase Storage without changing component imports
export const uploadToCloudinary = async (file) => {
  return await uploadToFirebaseStorage(file);
};

// API instances mapping Firestore Collection names
export const aboutAPI = createAPI('about');
export const whyChooseUsAPI = createAPI('whyChooseUs');
export const batchesAPI = createAPI('batches');
export const membershipsAPI = createAPI('memberships');
export const transformationsAPI = createAPI('transformations');
export const expertsAPI = createAPI('experts');
export const eventsAPI = createAPI('events');
export const contactsAPI = createAPI('contacts');
export const joinRequestsAPI = createAPI('joinRequests');
export const membersAPI = createAPI('members');
export const batchMembersAPI = createAPI('batchMembers');
export const adminsAPI = createAPI('admins');